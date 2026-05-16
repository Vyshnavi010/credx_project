export interface PlanDetails {
  name: string;
  pricePerSeat: number; // in USD
  minSeats?: number;
  maxSeats?: number;
  description: string;
  pricingUrl: string;
}

export interface ToolPricing {
  id: string;
  name: string;
  category: "editor-plugin" | "editor-standalone" | "chat-assistant" | "api";
  plans: {
    [planId: string]: PlanDetails;
  };
}

export const PRICING_DATA: { [toolId: string]: ToolPricing } = {
  cursor: {
    id: "cursor",
    name: "Cursor",
    category: "editor-standalone",
    plans: {
      hobby: {
        name: "Hobby",
        pricePerSeat: 0,
        description: "Free tier with basic usage limits",
        pricingUrl: "https://www.cursor.com/pricing"
      },
      pro: {
        name: "Pro",
        pricePerSeat: 20,
        description: "Unlimited key features, 500 fast requests/mo",
        pricingUrl: "https://www.cursor.com/pricing"
      },
      business: {
        name: "Business",
        pricePerSeat: 40,
        description: "Centralized billing, admin controls, higher limits",
        pricingUrl: "https://www.cursor.com/pricing"
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 100, // custom price estimation for modeling
        description: "Custom models, advanced SSO, security controls",
        pricingUrl: "https://www.cursor.com/pricing"
      }
    }
  },
  copilot: {
    id: "copilot",
    name: "GitHub Copilot",
    category: "editor-plugin",
    plans: {
      individual: {
        name: "Individual",
        pricePerSeat: 10,
        description: "For individual developers and freelancers",
        pricingUrl: "https://github.com/features/copilot#pricing"
      },
      business: {
        name: "Business",
        pricePerSeat: 19,
        description: "For teams, organization management, policy controls",
        pricingUrl: "https://github.com/features/copilot#pricing"
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 39,
        description: "Custom models, documentation search, advanced security",
        pricingUrl: "https://github.com/features/copilot#pricing"
      }
    }
  },
  claude: {
    id: "claude",
    name: "Claude.ai",
    category: "chat-assistant",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        description: "Basic access to Claude models",
        pricingUrl: "https://www.anthropic.com/claude"
      },
      pro: {
        name: "Pro",
        pricePerSeat: 20,
        description: "5x usage of Free tier, priority access",
        pricingUrl: "https://www.anthropic.com/claude"
      },
      team: {
        name: "Team",
        pricePerSeat: 25,
        minSeats: 5,
        description: "Increased usage limits, shared chats (min 5 seats)",
        pricingUrl: "https://www.anthropic.com/claude"
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 75, // custom estimation for calculation
        description: "Advanced admin controls, enterprise integrations",
        pricingUrl: "https://www.anthropic.com/claude"
      }
    }
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    category: "chat-assistant",
    plans: {
      plus: {
        name: "Plus",
        pricePerSeat: 20,
        description: "Access to GPT-4o, advanced data analysis",
        pricingUrl: "https://openai.com/chatgpt/pricing"
      },
      team: {
        name: "Team",
        pricePerSeat: 25, // Billed annually, or $30/mo monthly. Let's model as $25/seat (min 2 seats)
        minSeats: 2,
        description: "Workspace features, admin console, data privacy",
        pricingUrl: "https://openai.com/chatgpt/pricing"
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 60, // custom estimation
        description: "Unlimited high-speed GPT-4o, SSO, admin controls",
        pricingUrl: "https://openai.com/chatgpt/pricing"
      }
    }
  },
  anthropic_api: {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    plans: {
      direct: {
        name: "Direct API Pay-as-you-go",
        pricePerSeat: 0, // Usage based
        description: "Direct API access billed on input/output tokens",
        pricingUrl: "https://www.anthropic.com/api"
      }
    }
  },
  openai_api: {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    plans: {
      direct: {
        name: "Direct API Pay-as-you-go",
        pricePerSeat: 0, // Usage based
        description: "Direct API access billed on input/output tokens",
        pricingUrl: "https://openai.com/api/pricing"
      }
    }
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    category: "chat-assistant",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        description: "Free version of Gemini",
        pricingUrl: "https://gemini.google.com/advanced"
      },
      advanced: {
        name: "Advanced (Pro/Ultra)",
        pricePerSeat: 20,
        description: "Access to 1.5 Pro/Ultra, Google Workspace integration",
        pricingUrl: "https://gemini.google.com/advanced"
      },
      business: {
        name: "Business / Team",
        pricePerSeat: 24,
        description: "Google Workspace enterprise security & administration",
        pricingUrl: "https://workspace.google.com/solutions/ai"
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 30,
        description: "Full AI security controls and full access features",
        pricingUrl: "https://workspace.google.com/solutions/ai"
      },
      api: {
        name: "Google AI Studio API",
        pricePerSeat: 0,
        description: "API access via Google AI Studio",
        pricingUrl: "https://ai.google.dev/pricing"
      }
    }
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    category: "editor-standalone",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        description: "Free version with basic limits",
        pricingUrl: "https://codeium.com/windsurf/pricing"
      },
      pro: {
        name: "Pro",
        pricePerSeat: 15, // Windsurf Pro is $15/mo
        description: "Unlimited premium models, advanced context",
        pricingUrl: "https://codeium.com/windsurf/pricing"
      },
      team: {
        name: "Team",
        pricePerSeat: 30,
        description: "Shared team settings, usage tracking, advanced security",
        pricingUrl: "https://codeium.com/windsurf/pricing"
      }
    }
  }
};
