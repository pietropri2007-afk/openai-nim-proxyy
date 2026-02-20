// server.js - OpenAI to NVIDIA NIM API Proxy - ULTIMATE EDITION 2025
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const NIM_API_BASE = 'https://integrate.api.nvidia.com/v1';
const NIM_API_KEY = process.env.NIM_API_KEY;

// 🔥 TODOS OS MODELOS DISPONÍVEIS NA NVIDIA (50+ MODELOS)
const MODEL_MAPPING = {
  // ============ PRINCIPAIS (MAIS USADOS) ============
  'gpt-3.5-turbo': 'meta/llama-3.1-8b-instruct',
  'gpt-4': 'qwen/qwen3-coder-480b-a35b-instruct',
  'gpt-4-turbo': 'moonshotai/kimi-k2-instruct-0905',
  'gpt-4o': 'deepseek-ai/deepseek-v3.1',
  'claude-3-opus': 'openai/gpt-oss-120b',
  'claude-3-sonnet': 'openai/gpt-oss-20b',
  'gemini-pro': 'qwen/qwen3-next-80b-a3b-thinking',
  
  // ============ TOP TIER (MELHORES) ============
  'deepseek-v3.1': 'deepseek-ai/deepseek-v3.1',
  'deepseek-v3.1-terminus': 'deepseek-ai/deepseek-v3.1-terminus',
  'deepseek-r1': 'deepseek-ai/deepseek-r1',
  'deepseek-r1-0528': 'deepseek-ai/deepseek-r1-0528',
  'glm-5': 'z-ai/glm5',
  'glm-4.7': 'z-ai/glm4.7',
  'nemotron-ultra-253b': 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  'nemotron-super-49b': 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
  'nemotron-nano-9b': 'nvidia/nvidia-nemotron-nano-9b-v2',
  'nemotron-nano-8b': 'nvidia/llama-3.1-nemotron-nano-8b-v1',
  
  // ============ QWEN FAMILY (CÓDIGO E RACIOCÍNIO) ============
  'qwen3-coder-480b': 'qwen/qwen3-coder-480b-a35b-instruct',
  'qwen3-next-80b': 'qwen/qwen3-next-80b-a3b-instruct',
  'qwen3-next-80b-thinking': 'qwen/qwen3-next-80b-a3b-thinking',
  'qwen3-235b': 'qwen/qwen3-235b-a22b',
  'qwen2.5-72b': 'qwen/qwen2.5-72b-instruct',
  'qwen2.5-coder-32b': 'qwen/qwen2.5-coder-32b-instruct',
  'qwen2.5-coder-7b': 'qwen/qwen2.5-coder-7b-instruct',
  'qwq-32b': 'qwen/qwq-32b',
  
  // ============ LLAMA FAMILY (META) ============
  'llama-3.3-70b': 'meta/llama-3.3-70b-instruct',
  'llama-3.1-70b': 'meta/llama-3.1-70b-instruct',
  'llama-3.1-8b': 'meta/llama-3.1-8b-instruct',
  'llama-4-maverick': 'meta/llama-4-maverick-17b-128e-instruct',
  'llama-4-scout': 'meta/llama-4-scout-17b-16e-instruct',
  
  // ============ MISTRAL FAMILY ============
  'mistral-large-3': 'mistralai/mistral-large-3-675b-instruct-2512',
  'mistral-medium-3': 'mistralai/mistral-medium-3-instruct',
  'mistral-small-3': 'mistralai/mistral-small-3.1-24b-instruct-2503',
  'mistral-small-24b': 'mistralai/mistral-small-24b-instruct',
  'mistral-nemotron': 'mistralai/mistral-nemotron',
  'devstral-2-123b': 'mistralai/devstral-2-123b-instruct-2512',
  'ministral-14b': 'mistralai/ministral-14b-instruct-2512',
  'magistral-small': 'mistralai/magistral-small-2506',
  
  // ============ KIMI (MOONSHOT) - CONTEXTO LONGO ============
  'kimi-k2-instruct': 'moonshotai/kimi-k2-instruct-0905',
  'kimi-k2-thinking': 'moonshotai/kimi-k2-thinking',
  
  // ============ MICROSOFT PHI FAMILY ============
  'phi-4-mini': 'microsoft/phi-4-mini-instruct',
  'phi-4-multimodal': 'microsoft/phi-4-multimodal-instruct',
  'phi-4-mini-flash': 'microsoft/phi-4-mini-flash-reasoning',
  'phi-3.5-mini': 'microsoft/phi-3.5-mini-instruct',
  'phi-3.5-vision': 'microsoft/phi-3.5-vision-instruct',
  
  // ============ GOOGLE GEMMA FAMILY ============
  'gemma-3-27b': 'google/gemma-3-27b-it',
  'gemma-3-1b': 'google/gemma-3-1b-it',
  'gemma-3n-e4b': 'google/gemma-3n-e4b-it',
  'gemma-3n-e2b': 'google/gemma-3n-e2b-it',
  
  // ============ OUTROS MODELOS POTENTES ============
  'minimax-m2': 'minimaxai/minimax-m2',
  'seed-oss-36b': 'bytedance/seed-oss-36b-instruct',
  'sarvam-m': 'sarvamai/sarvam-m',
  'stockmark-2-100b': 'stockmark/stockmark-2-100b-instruct',
  'bielik-11b': 'speakleash/bielik-11b-v2.6-instruct',
  'marin-8b': 'marin/marin-8b-instruct',
  
  // ============ MODELOS ESPECIALIZADOS ============
  'granite-3.3-8b': 'ibm/granite-3.3-8b-instruct',
  'granite-guardian': 'ibm/granite-guardian-3.0-8b',
  'jamba-1.5-mini': 'ai21labs/jamba-1.5-mini-instruct',
  'rakutenai-7b': 'rakuten/rakutenai-7b-instruct',
  'rakutenai-7b-chat': 'rakuten/rakutenai-7b-chat',
  'falcon3-7b': 'tiiuae/falcon3-7b-instruct',
  'eurollm-9b': 'utter-project/eurollm-9b-instruct',
  'teuken-7b': 'opengpt-x/teuken-7b-instruct-commercial-v0.4',
  
  // ============ MODELOS MULTIMODAIS (VISÃO) ============
  'cosmos-nemotron-34b': 'nvidia/cosmos-nemotron-34b',
  'nemotron-nano-vl-8b': 'nvidia/llama-3.1-nemotron-nano-vl-8b-v1',
  'nemotron-nano-vl-12b': 'nvidia/nemotron-nano-12b-v2-vl',
  'vila': 'nvidia/vila',
  
  // ============ MODELOS DE RACIOCÍNIO ============
  'deepseek-r1-distill-qwen-32b': 'deepseek-ai/deepseek-r1-distill-qwen-32b',
  'deepseek-r1-distill-qwen-14b': 'deepseek-ai/deepseek-r1-distill-qwen-14b',
  'deepseek-r1-distill-qwen-7b': 'deepseek-ai/deepseek-r1-distill-qwen-7b',
  'deepseek-r1-distill-llama-8b': 'deepseek-ai/deepseek-r1-distill-llama-8b',
  'cosmos-reason1-7b': 'nvidia/cosmos-reason1-7b',
  
  // ============ MODELOS REGIONAIS ============
  'llama-3-taiwan-70b': 'yentinglin/llama-3-taiwan-70b-instruct',
  'llama-3-swallow-70b': 'tokyotech-llm/llama-3-swallow-70b-instruct-v0.1',
  'llama-3.1-swallow-70b': 'institute-of-science-tokyo/llama-3.1-swallow-70b-instruct-v0.1',
  'llama-3.1-swallow-8b': 'institute-of-science-tokyo/llama-3.1-swallow-8b-instruct-v0.1',
  'nemotron-4-mini-hindi-4b': 'nvidia/nemotron-4-mini-hindi-4b-instruct',
  
  // ============ MODELOS COMPACTOS (EDGE) ============
  'nemotron-mini-4b': 'nvidia/nemotron-mini-4b-instruct',
  'llama-3.1-nano-4b': 'nvidia/llama-3.1-nemotron-nano-4b-v1.1',
  'mistral-nemo-minitron-8b': 'nvidia/mistral-nemo-minitron-8b-base'
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'OpenAI to NVIDIA NIM Proxy - ULTIMATE Edition 2025',
    total_models: Object.keys(MODEL_MAPPING).length,
    version: '3.0'
  });
});

// List all models
app.get('/v1/models', (req, res) => {
  const models = Object.keys(MODEL_MAPPING).map(model => ({
    id: model,
    object: 'model',
    created: Date.now(),
    owned_by: 'nvidia-nim-proxy'
  }));
  res.json({ 
    object: 'list', 
    data: models 
  });
});

// Chat completions endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens, stream } = req.body;
    
    // Smart model selection with fallback
    let nimModel = MODEL_MAPPING[model];
    
    if (!nimModel) {
      // Try using the model name directly
      try {
        const testResponse = await axios.post(`${NIM_API_BASE}/chat/completions`, {
          model: model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        }, {
          headers: { 
            'Authorization': `Bearer ${NIM_API_KEY}`, 
            'Content-Type': 'application/json' 
          },
          validateStatus: (status) => status < 500
        });
        
        if (testResponse.status >= 200 && testResponse.status < 300) {
          nimModel = model;
        }
      } catch (e) {
        console.log('Model not found, using fallback');
      }
      
      // Ultimate fallback
      if (!nimModel) {
        nimModel = 'meta/llama-3.1-8b-instruct';
      }
    }
    
    const nimRequest = {
      model: nimModel,
      messages: messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 9024,
      stream: stream || false
    };
    
    const response = await axios.post(`${NIM_API_BASE}/chat/completions`, nimRequest, {
      headers: {
        'Authorization': `Bearer ${NIM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: stream ? 'stream' : 'json'
    });
    
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.data.pipe(res);
    } else {
      const openaiResponse = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: response.data.choices.map(choice => ({
          index: choice.index,
          message: {
            role: choice.message?.role || 'assistant',
            content: choice.message?.content || ''
          },
          finish_reason: choice.finish_reason
        })),
        usage: response.data.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
      res.json(openaiResponse);
    }
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: {
        message: error.message || 'Internal server error',
        type: 'invalid_request_error',
        code: error.response?.status || 500
      }
    });
  }
});

// Catch-all 404
app.all('*', (req, res) => {
  res.status(404).json({
    error: {
      message: `Endpoint ${req.path} not found`,
      type: 'invalid_request_error',
      code: 404
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ OpenAI to NVIDIA NIM Proxy - ULTIMATE Edition`);
  console.log(`🚀 Running on port ${PORT}`);
  console.log(`📦 ${Object.keys(MODEL_MAPPING).length} models available`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
