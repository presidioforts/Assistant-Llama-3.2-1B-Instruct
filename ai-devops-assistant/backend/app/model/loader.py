import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging
from utils.config import Config

logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = self._get_device()
        self.load_model()
    
    def _get_device(self):
        """Determine the best device to use"""
        if torch.cuda.is_available():
            device = "cuda"
            logger.info(f"Using CUDA device: {torch.cuda.get_device_name()}")
        else:
            device = "cpu"
            logger.info("Using CPU device")
        return device
    
    def load_model(self):
        """Load the Llama-3.2-1B-Instruct model"""
        try:
            logger.info("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                Config.MODEL_NAME,
                trust_remote_code=True
            )
            
            # Set pad token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            logger.info("Loading model...")
            self.model = AutoModelForCausalLM.from_pretrained(
                Config.MODEL_NAME,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True
            )
            
            if self.device == "cpu":
                self.model = self.model.to(self.device)
            
            logger.info("Model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise e
    
    def get_model(self):
        return self.model
    
    def get_tokenizer(self):
        return self.tokenizer 