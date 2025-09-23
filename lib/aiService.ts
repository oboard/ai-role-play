import { Character, Evidence } from '@/types/game';

// Mock AI service - in a real application, this would use Vercel AI SDK
export async function generateAIResponse(
  message: string, 
  character: Character, 
  conversationHistory: any[]
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Generate contextual responses based on character and message
  const responses = getCharacterResponses(character, message.toLowerCase());
  
  // Select a random appropriate response
  return responses[Math.floor(Math.random() * responses.length)];
}

function getCharacterResponses(character: Character, message: string): string[] {
  const baseResponses: { [key: string]: { [key: string]: string[] } } = {
    'guard': {
      'default': [
        "Look, I'm just doing my job here. I can't help everyone who claims they're innocent.",
        "You want to know something? Start talking. But don't waste my time with lies.",
        "I've been working here long enough to spot the guilty ones. What makes you different?"
      ],
      'jewelry': [
        "The jewelry store? Yeah, I heard about that. Someone said they saw you coming out with a bag.",
        "That witness seemed pretty sure it was you. Had a clear view from across the street.",
        "But you know what's odd? The witness description was a bit... vague in some details."
      ],
      'evidence': [
        "Evidence? Ha! If you had real evidence, you wouldn't be here.",
        "I've seen plenty of prisoners try to cook up stories. You better have something solid.",
        "You know, there was some strange activity the night you were brought in..."
      ],
      'witness': [
        "The witness? Some shopkeeper from across the street. Seemed nervous when giving the statement.",
        "Funny thing about that witness - they mentioned seeing someone, but couldn't describe the clothes clearly.",
        "Between you and me, that witness statement had some holes in it."
      ]
    },
    'cellmate': {
      'default': [
        "I've been watching this place for months. You learn to notice things when you're stuck here.",
        "You seem different from the usual crowd. Most guilty people don't ask the right questions.",
        "I might be able to help you, but you need to listen carefully to what I'm about to tell you."
      ],
      'guard': [
        "That guard Zhang? He was acting strange the night you arrived. Kept looking around nervous-like.",
        "I saw him going through some belongings that night. Not yours - someone else's.",
        "He was looking for something specific. Kept muttering about 'finding that piece of cloth'."
      ],
      'night': [
        "The night you were brought in, I couldn't sleep. Heard a lot of movement outside the cells.",
        "Someone was definitely searching for something. I heard whispering and footsteps.",
        "There's a mouse in the corner over there. It's been chewing on something for days now."
      ],
      'mouse': [
        "That little guy? He found something interesting. A piece of torn fabric with some kind of marking on it.",
        "The fabric has strange symbols on it. Almost like someone was trying to hide a message.",
        "I think that cloth might be important. The guard was looking for something like that."
      ]
    },
    'prisoner': {
      'default': [
        "I don't know anything about anything, got it? I keep my mouth shut around here.",
        "Why should I trust you? For all I know, you could be working with them.",
        "Look, I've got my own problems. I don't need to get involved in yours."
      ],
      'jewelry': [
        "The jewelry store... yeah, I know that place. Never stole from there though.",
        "I might have been in the area that day, but I didn't see anything suspicious.",
        "Well... maybe I did see someone running from that direction. But it wasn't you."
      ],
      'thief': [
        "There's someone else who's been bragging about hitting jewelry stores lately.",
        "This guy I know, he's got a thing for expensive jewelry. Always wearing new pieces.",
        "He was showing off some new rings the day after your arrest. Coincidence?"
      ],
      'pressure': [
        "I can't say too much. Some people don't want me talking about what I saw.",
        "There's been some... pressure to keep quiet about certain things.",
        "If I tell you what I really know, I might end up in worse trouble than I already am."
      ]
    }
  };

  const characterResponses = baseResponses[character.id] || baseResponses['guard'];

  // Determine response category based on message content
  let category = 'default';
  if (message.includes('jewelry') || message.includes('store')) category = 'jewelry';
  else if (message.includes('evidence') || message.includes('proof')) category = 'evidence';
  else if (message.includes('witness') || message.includes('saw')) category = 'witness';
  else if (message.includes('guard') || message.includes('zhang')) category = 'guard';
  else if (message.includes('night') || message.includes('heard')) category = 'night';
  else if (message.includes('mouse') || message.includes('corner')) category = 'mouse';
  else if (message.includes('thief') || message.includes('steal')) category = 'thief';
  else if (message.includes('pressure') || message.includes('quiet')) category = 'pressure';

  return characterResponses[category] || characterResponses['default'];
}

export async function evaluateEvidence(evidence: Evidence[], timeRemaining: number): Promise<string> {
  // Simulate AI evaluation delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const evidenceCount = evidence.length;
  const timeUsed = 600 - timeRemaining;

  // Analyze evidence content for key elements
  const evidenceText = evidence.map(e => e.content.toLowerCase()).join(' ');
  
  const hasWitnessEvidence = evidenceText.includes('witness') || evidenceText.includes('saw');
  const hasClothEvidence = evidenceText.includes('cloth') || evidenceText.includes('fabric') || evidenceText.includes('symbol');
  const hasGuardEvidence = evidenceText.includes('guard') || evidenceText.includes('search') || evidenceText.includes('nervous');
  const hasAlibiEvidence = evidenceText.includes('alibi') || evidenceText.includes('elsewhere');
  const hasRealThiefEvidence = evidenceText.includes('real thief') || evidenceText.includes('other thief') || evidenceText.includes('bragging');

  let score = 0;
  let reasoning = "Based on your evidence:\n\n";

  if (hasWitnessEvidence) {
    score += 2;
    reasoning += "• You discovered issues with the witness testimony, which raises doubt about their reliability.\n";
  }

  if (hasClothEvidence) {
    score += 3;
    reasoning += "• The fabric with strange symbols is a crucial piece of evidence that suggests someone was trying to frame you.\n";
  }

  if (hasGuardEvidence) {
    score += 2;
    reasoning += "• The guard's suspicious behavior indicates possible corruption or manipulation of evidence.\n";
  }

  if (hasRealThiefEvidence) {
    score += 3;
    reasoning += "• Evidence pointing to the real thief significantly strengthens your case.\n";
  }

  // Time bonus/penalty
  if (timeUsed < 300) {
    score += 1;
    reasoning += "• You worked efficiently and gathered evidence quickly.\n";
  } else if (timeUsed > 500) {
    score -= 1;
    reasoning += "• Time pressure may have affected the thoroughness of your investigation.\n";
  }

  // Evidence quantity factor
  if (evidenceCount >= 5) {
    score += 1;
    reasoning += "• You collected a substantial amount of evidence.\n";
  } else if (evidenceCount < 3) {
    score -= 1;
    reasoning += "• Your evidence collection was somewhat limited.\n";
  }

  reasoning += "\n";

  // Generate verdict based on score
  if (score >= 7) {
    return reasoning + "🏆 VERDICT: INNOCENT - CASE DISMISSED\n\nYour evidence is overwhelming and clearly demonstrates your innocence. The combination of witness inconsistencies, the planted evidence, and identification of the real perpetrator leaves no doubt. You are immediately released and all charges are dropped. Justice has been served!";
  } else if (score >= 5) {
    return reasoning + "✅ VERDICT: REASONABLE DOUBT ESTABLISHED\n\nWhile not completely conclusive, your evidence raises significant doubt about your guilt. The inconsistencies you've uncovered warrant further investigation. Your case will be reviewed, and you'll likely be released pending a new investigation. Well done!";
  } else if (score >= 3) {
    return reasoning + "⚖️ VERDICT: INSUFFICIENT EVIDENCE\n\nYour evidence raises some questions but isn't strong enough to overturn the conviction. However, your efforts have not been in vain - this information will be passed to your lawyer for appeal. There's still hope for your freedom, but you'll need to remain in custody for now.";
  } else {
    return reasoning + "❌ VERDICT: GUILTY AS CHARGED\n\nUnfortunately, the evidence you presented is insufficient to challenge the original conviction. The witness testimony and physical evidence still point to your guilt. You will serve your sentence as originally determined. Better luck in your appeals process.";
  }
}