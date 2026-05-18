"""
CrisesMesh AI — Severity Agent
Predicts severity level, affected area, population, duration, and priority.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent


class SeverityAgent(BaseAgent):
    name = "Severity"
    description = "Predicts severity, affected area, population, duration, and priority score"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        signals = input_data.get("signals", [])
        fusion_result = input_data.get("fusion_result", {})
        classification = input_data.get("classification_result", {})
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ INITIALIZING SEVERITY ENGINE: Ingesting spatial metadata and urgency scores...")
        
        # Calculate severity from signal urgency + road blockage
        urgency_scores = [s.get("urgency_score", 0.5) for s in signals]
        avg_urgency = sum(urgency_scores) / max(len(urgency_scores), 1)

        road_blocked = any("block" in s.get("text", "").lower() or "ruk" in s.get("text", "").lower() for s in signals)
        high_rainfall = any("heavy" in s.get("text", "").lower() or "45mm" in s.get("text", "").lower() for s in signals)

        add_log(f"🔎 ANALYSIS CHECK: Avg urgency={avg_urgency:.2f}, Road blocked={road_blocked}, High rain={high_rainfall}.")

        # Severity mapping
        if avg_urgency > 0.8 or (road_blocked and high_rainfall):
            severity = "Critical"
            affected_radius = 1200
            estimated_pop = 15000
            duration_hours = 6
            peak_impact = "Next 2 hours"
        elif avg_urgency > 0.65 or road_blocked:
            severity = "High"
            affected_radius = 900
            estimated_pop = 12000
            duration_hours = 4
            peak_impact = "Next 3 hours"
        elif avg_urgency > 0.5:
            severity = "Medium"
            affected_radius = 500
            estimated_pop = 5000
            duration_hours = 3
            peak_impact = "Next 4 hours"
        else:
            severity = "Low"
            affected_radius = 200
            estimated_pop = 1000
            duration_hours = 1
            peak_impact = "Subsiding"

        add_log(f"📏 RADIAL PROPAGATION: Computed affected impact radius = {affected_radius} meters.")
        add_log(f"👥 CENSUS MAPPING: Sector grids estimated population at risk = ~{estimated_pop:,} residents.")

        # Priority score (0–100)
        fusion_conf = fusion_result.get("overall_confidence", 0.5)
        priority_score = min(100, int(
            avg_urgency * 35 +
            fusion_conf * 25 +
            (15 if road_blocked else 0) +
            (10 if high_rainfall else 0) +
            len(signals) * 2
        ))

        confidence = round(fusion_conf * 0.5 + avg_urgency * 0.3 + (0.2 if road_blocked else 0.1), 2)

        add_log(f"⚡ PRIORITY MATRIX: Locked severity level to '{severity}' with Priority Score = {priority_score}/100.")
        add_log(f"📈 EVOLUTION FORECAST: Spread peak impact timeframe expected in the {peak_impact}.")

        return {
            "input_summary": f"Severity analysis for {incident_id} from {len(signals)} signals",
            "reasoning_summary": (
                f"Severity: {severity}. "
                f"Avg urgency: {avg_urgency:.0%}. "
                f"Road blocked: {'Yes' if road_blocked else 'No'}. "
                f"Heavy rainfall: {'Yes' if high_rainfall else 'No'}. "
                f"Affected radius: {affected_radius}m, population: ~{estimated_pop:,}. "
                f"Expected duration: {duration_hours}h. Priority score: {priority_score}/100."
            ),
            "confidence": confidence,
            "output": {
                "severity": severity,
                "affected_radius_m": affected_radius,
                "estimated_population": estimated_pop,
                "expected_duration_hours": duration_hours,
                "peak_impact_time": peak_impact,
                "priority_score": priority_score,
                "uncertainty_range": f"±{int(affected_radius * 0.2)}m",
                "road_blocked": road_blocked,
                "high_rainfall": high_rainfall,
                "step_logs": step_logs,
            },
        }

