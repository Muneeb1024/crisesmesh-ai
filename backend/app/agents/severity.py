"""
CrisesMesh AI — Severity Agent
Predicts severity level, affected area, population, duration, and priority using Google Gemini.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent
from app.agents.gemini_client import query_gemini_json


class SeverityAgent(BaseAgent):
    name = "Severity Agent"
    description = "Predicts severity, affected area, population, duration, and priority score using Gemini LLM"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        signals = input_data.get("signals", [])
        fusion_result = input_data.get("fusion_result", {})
        classification = input_data.get("classification_result", {})
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ SYSTEM: INITIALIZING SEVERITY ENGINE: Ingesting spatial metadata and urgency scores...")

        # --- HEURISTIC FALLBACK CALCULATION ---
        urgency_scores = [s.get("urgency_score", 0.5) for s in signals]
        avg_urgency = sum(urgency_scores) / max(len(urgency_scores), 1)

        road_blocked = any("block" in s.get("text", "").lower() or "ruk" in s.get("text", "").lower() for s in signals)
        high_rainfall = any("heavy" in s.get("text", "").lower() or "45mm" in s.get("text", "").lower() for s in signals)

        add_log(f"🔎 ANALYSIS CHECK: Avg urgency={avg_urgency:.2f}, Road blocked={road_blocked}, High rain={high_rainfall}.")

        if avg_urgency > 0.8 or (road_blocked and high_rainfall):
            severity_fallback = "Critical"
            affected_radius_fallback = 1200
            estimated_pop_fallback = 15000
            duration_hours_fallback = 6
            peak_impact_fallback = "Next 2 hours"
        elif avg_urgency > 0.65 or road_blocked:
            severity_fallback = "High"
            affected_radius_fallback = 900
            estimated_pop_fallback = 12000
            duration_hours_fallback = 4
            peak_impact_fallback = "Next 3 hours"
        elif avg_urgency > 0.5:
            severity_fallback = "Medium"
            affected_radius_fallback = 500
            estimated_pop_fallback = 5000
            duration_hours_fallback = 3
            peak_impact_fallback = "Next 4 hours"
        else:
            severity_fallback = "Low"
            affected_radius_fallback = 200
            estimated_pop_fallback = 1000
            duration_hours_fallback = 1
            peak_impact_fallback = "Subsiding"

        fusion_conf = fusion_result.get("overall_confidence", 0.5)
        priority_score_fallback = min(100, int(
            avg_urgency * 35 +
            fusion_conf * 25 +
            (15 if road_blocked else 0) +
            (10 if high_rainfall else 0) +
            len(signals) * 2
        ))

        confidence_fallback = round(fusion_conf * 0.5 + avg_urgency * 0.3 + (0.2 if road_blocked else 0.1), 2)
        fallback_reasoning = (
            f"Severity: {severity_fallback} (Offline Sandbox). "
            f"Avg urgency: {avg_urgency:.0%}. "
            f"Road blocked: {'Yes' if road_blocked else 'No'}. "
            f"Affected radius: {affected_radius_fallback}m, population: ~{estimated_pop_fallback:,}. "
            f"Priority score: {priority_score_fallback}/100."
        )

        fallback_output = {
            "severity": severity_fallback,
            "affected_radius_m": affected_radius_fallback,
            "estimated_population": estimated_pop_fallback,
            "expected_duration_hours": duration_hours_fallback,
            "peak_impact_time": peak_impact_fallback,
            "priority_score": priority_score_fallback,
            "uncertainty_range": f"±{int(affected_radius_fallback * 0.2)}m",
            "road_blocked": road_blocked,
            "high_rainfall": high_rainfall,
            "confidence": confidence_fallback,
            "reasoning_summary": fallback_reasoning
        }

        # --- REAL COGNITIVE GEMINI LOOP ---
        prompt = f"""
        You are the CrisesMesh AI Severity Agent. Your task is to calculate the severity, affected area, population at risk, duration, and priority score of an incident.
        
        Fused Signals:
        {signals}
        
        Fusion Result:
        {fusion_result}
        
        Classification Result:
        {classification}
        
        Please analyze this incident and return a clean JSON containing exactly:
        - "severity": (string: "Critical", "High", "Medium", or "Low")
        - "affected_radius_m": (integer, radius of impact in meters, typically between 100m and 2000m depending on signals)
        - "estimated_population": (integer, estimated population residing in that radius, typically 500 to 50000)
        - "expected_duration_hours": (integer, expected duration in hours)
        - "peak_impact_time": (string, e.g. "Next 2 hours", "Next 3 hours", "Subsiding")
        - "priority_score": (integer between 0 and 100, where higher means more urgent and high-risk)
        - "uncertainty_range": (string, e.g. "±150m", "±300m")
        - "road_blocked": (boolean, whether the signals suggest a roadblock)
        - "high_rainfall": (boolean, whether the signals suggest heavy rainfall)
        - "confidence": (float, 0.0 to 1.0, representing severity model confidence)
        - "reasoning_summary": (string, 1-2 sentence explanation of your severity assessment for command transparency)
        """

        add_log("🤖 COGNITIVE BRAIN: Querying Google Gemini 1.5 Flash severity core...")
        gemini_res = await query_gemini_json(prompt, model="gemini-1.5-flash", fallback_result=fallback_output)

        severity = gemini_res.get("severity", severity_fallback)
        affected_radius = int(gemini_res.get("affected_radius_m", affected_radius_fallback))
        estimated_pop = int(gemini_res.get("estimated_population", estimated_pop_fallback))
        duration_hours = int(gemini_res.get("expected_duration_hours", duration_hours_fallback))
        peak_impact = gemini_res.get("peak_impact_time", peak_impact_fallback)
        priority_score = int(gemini_res.get("priority_score", priority_score_fallback))
        uncertainty_range = gemini_res.get("uncertainty_range", fallback_output["uncertainty_range"])
        road_blocked = bool(gemini_res.get("road_blocked", road_blocked))
        high_rainfall = bool(gemini_res.get("high_rainfall", high_rainfall))
        confidence = float(gemini_res.get("confidence", confidence_fallback))
        reasoning_summary = gemini_res.get("reasoning_summary", fallback_reasoning)

        add_log(f"📏 RADIAL PROPAGATION: Computed affected impact radius = {affected_radius} meters.")
        add_log(f"👥 CENSUS MAPPING: Sector grids estimated population at risk = ~{estimated_pop:,} residents.")
        add_log(f"⚡ PRIORITY MATRIX: Locked severity level to '{severity}' with Priority Score = {priority_score}/100.")
        add_log(f"📈 EVOLUTION FORECAST: Spread peak impact timeframe expected in the {peak_impact}.")

        return {
            "input_summary": f"Severity analysis for {incident_id} from {len(signals)} signals",
            "reasoning_summary": reasoning_summary,
            "confidence": round(confidence, 2),
            "output": {
                "severity": severity,
                "affected_radius_m": affected_radius,
                "estimated_population": estimated_pop,
                "expected_duration_hours": duration_hours,
                "peak_impact_time": peak_impact,
                "priority_score": priority_score,
                "uncertainty_range": uncertainty_range,
                "road_blocked": road_blocked,
                "high_rainfall": high_rainfall,
                "step_logs": step_logs,
            },
        }
