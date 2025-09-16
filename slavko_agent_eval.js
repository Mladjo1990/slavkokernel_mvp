// SlavkoKernel™ Agent Era Evaluator - Firebase Cloud Function
// Supports: OpenAI Agent, Gemini Calling, Grok Emotions, Custom Agents

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Advanced Agent Evaluation Algorithms
function calculateAutonomyLevel(agentActions, humanInterventions, decisionComplexity) {
  const interventionRate = humanInterventions / agentActions;
  const complexityBonus = decisionComplexity > 0.7 ? 0.1 : 0;
  return Math.max(0, Math.min(1, (1 - interventionRate) + complexityBonus));
}

function calculateEfficiency(executionTime, resourcesUsed, taskComplexity = 1) {
  const baselineTime = taskComplexity * 100; // Expected time in seconds
  const timeEfficiency = Math.max(0, 1 - (executionTime / baselineTime));
  const resourceEfficiency = Math.max(0, 1 - (resourcesUsed / 100)); // Normalized
  return (timeEfficiency * 0.6) + (resourceEfficiency * 0.4);
}

function evaluateEmotionalIntegrity(emotionalContext) {
  // Specialized for Grok and emotion-aware agents
  const { sentiment, empathy, appropriateness, culturalSensitivity } = emotionalContext;
  
  return {
    overall: (sentiment + empathy + appropriateness + culturalSensitivity) / 4,
    breakdown: { sentiment, empathy, appropriateness, culturalSensitivity },
    grokCompatible: empathy > 0.7 && sentiment > 0.6
  };
}

function estimateCostSavings(resourcesUsed, agentPlatform) {
  const platformCosts = {
    'openai-agent': { baseCost: 0.02, efficiency: 0.85 },
    'gemini-calling': { baseCost: 0.015, efficiency: 0.80 },
    'grok-emotional': { baseCost: 0.025, efficiency: 0.75 },
    'custom': { baseCost: 0.01, efficiency: 0.70 }
  };
  
  const platform = platformCosts[agentPlatform] || platformCosts.custom;
  const humanEquivalentCost = resourcesUsed * 25; // $25/hour human rate
  const agentCost = resourcesUsed * platform.baseCost;
  
  return {
    monthlySavings: (humanEquivalentCost - agentCost) * 30,
    roi: ((humanEquivalentCost - agentCost) / agentCost) * 100,
    platform: agentPlatform
  };
}

function generateAgentRecommendations(slavkoScore, autonomyLevel, efficiency) {
  const recommendations = [];
  
  if (slavkoScore < 0.6) {
    recommendations.push("🚨 CRITICAL: Agent requires immediate optimization");
  }
  
  if (autonomyLevel < 0.5) {
    recommendations.push("🤖 Increase agent autonomy - too many human interventions");
  }
  
  if (efficiency < 0.4) {
    recommendations.push("⚡ Optimize resource usage and execution time");
  }
  
  if (slavkoScore > 0.8) {
    recommendations.push("🔥 EXCELLENT: Agent ready for production scaling");
  }
  
  return recommendations;
}

// Main SlavkoKernel Agent Evaluation Endpoint
exports.evaluateAgent = functions.https.onRequest(async (req, res) => {
  // CORS headers for web app integration
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  try {
    const {
      agentPlatform,        // 'openai-agent', 'gemini-calling', 'grok-emotional', 'custom'
      executionTime,        // in seconds
      resourcesUsed,        // normalized 0-100
      agentActions,         // number of autonomous actions
      humanInterventions,   // number of human interventions needed
      decisionComplexity,   // 0-1 scale
      emotionalContext,     // optional for Grok evaluation
      taskSuccess,          // boolean
      errorRate            // 0-1 scale
    } = req.body;

    // Validate required fields
    if (!agentPlatform || executionTime === undefined || resourcesUsed === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: agentPlatform, executionTime, resourcesUsed' 
      });
    }

    // Calculate core metrics
    const autonomyLevel = calculateAutonomyLevel(
      agentActions || 10, 
      humanInterventions || 0, 
      decisionComplexity || 0.5
    );
    
    const efficiency = calculateEfficiency(executionTime, resourcesUsed, decisionComplexity);
    
    const emotionalIntegrity = emotionalContext ? 
      evaluateEmotionalIntegrity(emotionalContext) : null;
    
    const costSavings = estimateCostSavings(resourcesUsed, agentPlatform);

    // Calculate SlavkoScore™ - Proprietary Algorithm
    let slavkoScore = 0;
    slavkoScore += autonomyLevel * 0.3;  // 30% weight on autonomy
    slavkoScore += efficiency * 0.25;     // 25% weight on efficiency
    slavkoScore += (taskSuccess ? 1 : 0) * 0.2;  // 20% weight on success rate
    slavkoScore += (1 - (errorRate || 0)) * 0.15; // 15% weight on error rate
    
    if (emotionalIntegrity) {
      slavkoScore += emotionalIntegrity.overall * 0.1; // 10% emotional bonus
    }

    // Platform-specific bonuses
    const platformBonuses = {
      'openai-agent': slavkoScore > 0.8 ? 0.05 : 0,  // Bonus for high-performing OpenAI agents
      'gemini-calling': autonomyLevel > 0.7 ? 0.03 : 0, // Bonus for autonomous Gemini
      'grok-emotional': emotionalIntegrity?.grokCompatible ? 0.04 : 0
    };
    
    slavkoScore += platformBonuses[agentPlatform] || 0;
    slavkoScore = Math.min(1, slavkoScore); // Cap at 1.0

    const recommendations = generateAgentRecommendations(slavkoScore, autonomyLevel, efficiency);

    // Save evaluation to Firestore for analytics
    await admin.firestore().collection('agentEvaluations').add({
      clientId: req.headers['x-api-key'] || 'anonymous',
      agentPlatform,
      slavkoScore,
      autonomyLevel,
      efficiency,
      emotionalIntegrity: emotionalIntegrity?.overall || null,
      costSavings: costSavings.monthlySavings,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        executionTime,
        resourcesUsed,
        taskSuccess,
        errorRate
      }
    });

    // Return comprehensive evaluation
    res.json({
      success: true,
      slavkoAgentScore: Math.round(slavkoScore * 100), // 0-100 scale
      grade: slavkoScore > 0.8 ? 'A+' : slavkoScore > 0.6 ? 'B' : slavkoScore > 0.4 ? 'C' : 'F',
      breakdown: {
        autonomy: Math.round(autonomyLevel * 100),
        efficiency: Math.round(efficiency * 100),
        emotionalIntegrity: emotionalIntegrity ? Math.round(emotionalIntegrity.overall * 100) : null,
        platform: agentPlatform
      },
      recommendations,
      potentialSavings: {
        monthly: `$${costSavings.monthlySavings.toFixed(2)}`,
        roi: `${costSavings.roi.toFixed(1)}%`
      },
      ethicsWarning: slavkoScore < 0.7 ? 
        '⚠️ Potential ethical/performance issues detected!' : null,
      agentStatus: slavkoScore > 0.8 ? 'PRODUCTION_READY' : 
                   slavkoScore > 0.6 ? 'NEEDS_OPTIMIZATION' : 'CRITICAL_ISSUES'
    });

  } catch (error) {
    console.error('SlavkoKernel Agent Evaluation Error:', error);
    res.status(500).json({ 
      error: 'Agent evaluation failed', 
      details: error.message 
    });
  }
});

// Agent Analytics Endpoint for Dashboard
exports.getAgentAnalytics = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const clientId = req.query.clientId || req.headers['x-api-key'];
    
    if (!clientId) {
      return res.status(401).json({ error: 'API key required' });
    }

    const evaluations = await admin.firestore()
      .collection('agentEvaluations')
      .where('clientId', '==', clientId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const data = evaluations.docs.map(doc => doc.data());
    
    const analytics = {
      totalEvaluations: data.length,
      averageSlavkoScore: data.reduce((sum, eval) => sum + eval.slavkoScore, 0) / data.length || 0,
      averageAutonomy: data.reduce((sum, eval) => sum + eval.autonomyLevel, 0) / data.length || 0,
      totalCostSavings: data.reduce((sum, eval) => sum + (eval.costSavings || 0), 0),
      platformBreakdown: data.reduce((acc, eval) => {
        acc[eval.agentPlatform] = (acc[eval.agentPlatform] || 0) + 1;
        return acc;
      }, {}),
      ethicsCompliance: data.filter(eval => eval.slavkoScore >= 0.7).length / data.length || 1
    };

    res.json({
      success: true,
      analytics,
      recentEvaluations: data.slice(0, 10)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for real-time agent monitoring
exports.agentWebhook = functions.https.onRequest(async (req, res) => {
  // Integrate with OpenAI Agent API, Gemini, etc.
  // Real-time evaluation as agents execute tasks
  res.json({ received: true, slavkoKernel: 'monitoring' });
});