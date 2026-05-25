"""
CrisesMesh AI — Vetting Agent
Validates citizen report credibility using confidence scoring.
Never hard-blocks — always returns a credibility score and proceeds.
"""

from typing import Any, Dict
from datetime import datetime, timezone
import httpx
import json
from app.agents.base_agent import BaseAgent
from app.agents.config import agent_settings


class VettingAgent(BaseAgent):
    name = "Vetting Agent"
    description = "Validates report credibility using NLP, geo-consistency, and AI scoring. Returns confidence score — never hard blocks pipeline."

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        signals = input_data.get("signals", [])
        fusion_result = input_data.get("fusion_result", {})
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("🔍 VETTING AGENT: Initializing credibility verification pipeline...")
        add_log(f"📋 INPUT REVIEW: Analyzing {len(signals)} incoming signal sources...")

        # Pull metrics from fusion result
        avg_credibility = fusion_result.get("avg_credibility", 0.75)
        signal_agreement = fusion_result.get("signal_agreement", 0.80)
        fusion_verdict = fusion_result.get("fusion_verdict", "CONFIRMED")
        num_signals = fusion_result.get("signal_count", len(signals))

        add_log(f"📊 SIGNAL CREDIBILITY BASELINE: {avg_credibility:.0%} from Signal Fusion Agent.")

        # Geo-consistency check
        geo_confidence = fusion_result.get("avg_geo_confidence", 0.75)
        add_log(f"🗺️ GEO-CONSISTENCY SCAN: Spatial location validation score {geo_confidence:.0%}")

        # Cross-source consistency
        cross_score = min(1.0, (avg_credibility * 0.4) + (signal_agreement * 0.35) + (geo_confidence * 0.25))
        add_log(f"🔗 CROSS-SOURCE CORRELATION: Agreement index computed at {cross_score:.0%}")

        # Try Gemini for advanced NLP vetting
        credibility_verdict = "CREDIBLE"
        reasoning = ""
        api_key = agent_settings.gemini_api_key

        if api_key and api_key != "mock_key":
            add_log("🤖 AI VETTING CORE: Querying Gemini LLM for semantic authenticity analysis...")
            try:
                prompt = (
                    f"You are a crisis report vetting agent. Evaluate these signals for authenticity:\n"
                    f"Signals: {json.dumps(signals[:3])}\n"
                    f"Fusion Result: avg_credibility={avg_credibility}, signal_agreement={signal_agreement}\n"
                    f"Return JSON with: credibility_score (0.0-1.0), credibility_verdict (CREDIBLE/NEEDS_REVIEW/SUSPICIOUS), reasoning_summary (1 sentence)"
                )
                async with httpx.AsyncClient(timeout=5.0) as client:
                    r = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/{agent_settings.default_model}:generateContent?key={api_key}",
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{"parts": [{"text": prompt}]}],
                            "generationConfig": {"responseMimeType": "application/json"}
                        }
                    )
                    if r.status_code == 200:
                        res = r.json()
                        text_resp = res["candidates"][0]["content"]["parts"][0]["text"]
                        ai_data = json.loads(text_resp)
                        cross_score = float(ai_data.get("credibility_score", cross_score))
                        credibility_verdict = ai_data.get("credibility_verdict", credibility_verdict)
                        reasoning = ai_data.get("reasoning_summary", "")
                        add_log("✅ AI VETTING COMPLETE: Gemini credibility assessment received.")
                    else:
                        add_log(f"⚠️ AI VETTING API: HTTP {r.status_code} — using local scoring engine.")
                        api_key = None
            except Exception as e:
                add_log(f"⚠️ AI VETTING OFFLINE: Falling back to rule-based vetting. ({str(e)[:60]})")
                api_key = None

        if not api_key or api_key == "mock_key" or not reasoning:
            add_log("⚙️ RULE-BASED VETTING: Applying multi-factor credibility matrix...")
            if cross_score >= 0.80:
                credibility_verdict = "CREDIBLE"
                reasoning = (
                    f"Report cluster verified across {num_signals} sources with {cross_score:.0%} credibility index. "
                    f"Geo-spatial consistency validated. Signal agreement at {signal_agreement:.0%}. Pipeline proceeding."
                )
            elif cross_score >= 0.60:
                credibility_verdict = "NEEDS_REVIEW"
                reasoning = (
                    f"Report shows moderate credibility ({cross_score:.0%}). "
                    f"Some signal inconsistencies detected but not blocking — elevated monitoring applied."
                )
            else:
                credibility_verdict = "SUSPICIOUS"
                reasoning = (
                    f"Low credibility score ({cross_score:.0%}) detected. "
                    f"Pipeline continues with reduced confidence weighting. Manual human review recommended."
                )

        add_log(f"🎯 VETTING RESULT: {credibility_verdict} — Credibility Score: {cross_score:.0%}")
        add_log("✅ PIPELINE HANDOFF: Passing verified context to Classification Agent...")

        return {
            "input_summary": f"Vetted {len(signals)} signals for incident {incident_id}",
            "reasoning_summary": reasoning,
            "confidence": round(cross_score, 2),
            "output": {
                "credibility_score": round(cross_score, 2),
                "credibility_verdict": credibility_verdict,
                "geo_consistency": round(geo_confidence, 2),
                "cross_source_agreement": round(signal_agreement, 2),
                "pipeline_action": "PROCEED",
                "step_logs": step_logs,
            }
        }
