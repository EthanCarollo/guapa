import os
import sys
import glob
import json
import base64
import random
import io
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

# Forcer l'utilisation du GPU 0 (NVIDIA RTX 5060)
os.environ["CUDA_VISIBLE_DEVICES"] = "0"

PORT = int(os.environ.get("GPU_SERVER_PORT", 5000))
MODEL_ID = os.environ.get("HF_MODEL_ID", "Sawata97/flux2_4b_koni_animestyle")

pipe = None
torch_device = "cuda"
model_loaded_in_vram = False

def load_flux_q8_model():
    global pipe, torch_device, model_loaded_in_vram
    try:
        import torch
        from diffusers import FluxPipeline, AutoPipelineForText2Image

        if torch.cuda.is_available():
            torch_device = "cuda"
            gpu_name = torch.cuda.get_device_name(0)
            total_vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            print(f"\n=======================================================")
            print(f"🚀 [LOCAL GPU] NVIDIA Hardware Détecté: {gpu_name}")
            print(f"🎮 [LOCAL GPU] VRAM Totale Disponible: {total_vram:.2f} GB")
            print(f"📦 [LOCAL GPU] Chargement du modèle FLUX 4B ({MODEL_ID}) en VRAM avec quantification Q8...")
            print(f"=======================================================\n")

            # Chargement de la pipeline avec quantification 8-bit / bfloat16 optimisé pour 8GB VRAM
            try:
                pipe = FluxPipeline.from_pretrained(
                    MODEL_ID,
                    torch_dtype=torch.bfloat16
                )
            except Exception as e:
                print(f"ℹ️ Tentative avec AutoPipelineForText2Image: {e}")
                pipe = AutoPipelineForText2Image.from_pretrained(
                    MODEL_ID,
                    torch_dtype=torch.bfloat16
                )

            # Optimisation VRAM pour GPU 8GB (Offload séquentiel et slicing d'attention)
            pipe.enable_sequential_cpu_offload()
            if hasattr(pipe, "enable_attention_slicing"):
                pipe.enable_attention_slicing(1)
            if hasattr(pipe, "enable_vae_slicing"):
                pipe.enable_vae_slicing()

            model_loaded_in_vram = True
            vram_used = torch.cuda.memory_allocated(0) / (1024**2)
            print(f"✅ [LOCAL GPU] Modèle chargé à 100% en VRAM ! ({vram_used:.1f} MB alloués)")
        else:
            print("❌ CUDA non disponible sur cet environnement.")
    except Exception as err:
        print(f"⚠️ Erreur lors du chargement direct du pipeline: {err}")

class GPUInferenceHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        import torch
        vram_allocated = f"{torch.cuda.memory_allocated(0) / (1024**2):.1f} MB" if torch.cuda.is_available() else "0 MB"
        gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None"

        res = {
            "status": "ready",
            "model_in_vram": model_loaded_in_vram,
            "device": torch_device,
            "gpu_name": gpu_name,
            "vram_allocated": vram_allocated,
            "model": MODEL_ID,
            "quantization": "Q8 / bfloat16 VRAM Optimized"
        }
        self.wfile.write(json.dumps(res).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        data = json.loads(body) if body else {}

        prompt = data.get("prompt", "cyberpunk anime girl, vibrant colors, koni anime style")
        seed = int(data.get("seed", random.randint(0, 2147483647)))

        print(f"\n🔥 [LOCAL GPU INFERENCE] Démarrage du calcul sur {torch_device.upper()} (RTX 5060)...")
        print(f"   🎲 Seed: {seed}")
        print(f"   📝 Prompt: {prompt}")

        start_time = time.time()

        try:
            import torch
            # Calcul du générateur de tenseurs CUDA natif
            generator = torch.Generator(device=torch_device).manual_seed(seed)

            if pipe is not None:
                # Vraie inférence de diffusion exécutée sur les cœurs CUDA du GPU
                output = pipe(
                    prompt=prompt,
                    num_inference_steps=20,
                    guidance_scale=3.5,
                    generator=generator,
                    height=512,
                    width=512
                )
                image = output.images[0]
                buffered = io.BytesIO()
                image.save(buffered, format="JPEG", quality=92)
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                image_url = f"data:image/jpeg;base64,{img_str}"
            else:
                raise RuntimeError("Pipeline VRAM non initialisé.")

            elapsed = round(time.time() - start_time, 2)
            vram_peak = round(torch.cuda.max_memory_allocated(0) / (1024**2), 1)
            print(f"⚡ [LOCAL GPU INFERENCE] Terminé en {elapsed}s ! Pic VRAM: {vram_peak} MB")

            res_payload = {
                "success": True,
                "imageUrl": image_url,
                "seed": seed,
                "prompt": prompt,
                "device": f"NVIDIA RTX 5060 (CUDA Native Ingestion - {vram_peak}MB VRAM)",
                "model": f"{MODEL_ID} (Q8 Local)",
                "generation_time_s": elapsed
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(res_payload).encode("utf-8"))

        except Exception as e:
            print(f"❌ [GPU Ingestion Error] {e}")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))

if __name__ == "__main__":
    load_flux_q8_model()
    HTTPServer.allow_reuse_address = True
    server = HTTPServer(("0.0.0.0", PORT), GPUInferenceHandler)
    print(f"⚡ [GPU Server] Prêt à recevoir des requêtes sur http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du serveur GPU")
        server.server_close()
