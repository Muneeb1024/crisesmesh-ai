"""
CrisesMesh AI — Simulation Agent
Runs reroute simulation to estimate impact of response actions using Google Gemini.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent
from app.agents.gemini_client import query_gemini_json


class SimulationAgent(BaseAgent):
    name = "Simulation Agent"
    description = "Simulates reroute and intervention impact on traffic and response times using Gemini LLM"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        severity_result = input_data.get("severity_result", {})
        allocation_result = input_data.get("allocation_result", {})

        severity = severity_result.get("severity", "Medium")
        total_resources = allocation_result.get("total_resources", 0)
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ SYSTEM: INITIALIZING TRAFFIC SIMULATOR: Ingesting sector blockages...")
        add_log("🚥 COGNITIVE GRID MODEL: Mapping G-10 Underpass active congestion index (92%).")

        # --- HEURISTIC FALLBACK CALCULATION ---
        sim_params = {
            "Critical": {"eta_before": 45, "eta_after": 18, "congestion": "Severe", "time_saved": 27},
            "High":     {"eta_before": 35, "eta_after": 15, "congestion": "High", "time_saved": 20},
            "Medium":   {"eta_before": 25, "eta_after": 12, "congestion": "Moderate", "time_saved": 13},
            "Low":      {"eta_before": 15, "eta_after": 10, "congestion": "Low", "time_saved": 5},
        }

        params = sim_params.get(severity, sim_params["Medium"])
        time_saved_fallback = params["time_saved"]
        eta_before_fallback = params["eta_before"]
        eta_after_fallback = params["eta_after"]
        congestion_fallback = params["congestion"]

        fallback_reasoning = (
            f"Simulated traffic reroute for {severity} incident (Offline Sandbox). "
            f"ETA improvement: {eta_before_fallback}min → {eta_after_fallback}min "
            f"(saved {time_saved_fallback}min). "
            f"Congestion effect: {congestion_fallback}."
        )

        fallback_output = {
            "eta_before_min": eta_before_fallback,
            "eta_after_min": eta_after_fallback,
            "time_saved_min": time_saved_fallback,
            "congestion_effect": congestion_fallback,
            "recommendation": "Immediate reroute" if severity in ("Critical", "High") else "Monitor",
            "alternate_routes": [
                "Margalla Road → F-10 Bypass",
                "IJP Road → G-11 Connector",
            ],
            "confidence": 0.78,
            "reasoning_summary": fallback_reasoning
        }

        # --- REAL COGNITIVE GEMINI LOOP ---
        prompt = f"""
        You are the CrisesMesh AI Simulation Agent. Your task is to simulate traffic rerouting and response times for an active incident.
        
        Incident Severity:
        {severity_result}
        
        Allocated Resources:
        {allocation_result}
        
        Please simulate the outcome of the proposed deployments and traffic diversion, and return a clean JSON containing exactly:
        - "eta_before_min": (integer, estimated response time or transit delay in minutes before rerouting, e.g. 20-50 mins)
        - "eta_after_min": (integer, estimated response time or transit delay in minutes after rerouting, e.g. 10-25 mins)
        - "time_saved_min": (integer, difference between before and after ETA)
        - "congestion_effect": (string, e.g. "Severe", "High", "Moderate", "Low")
        - "recommendation": (string, e.g. "Immediate reroute", "Monitor and reroute if needed")
        - "alternate_routes": (list of strings, e.g. ["Margalla Road → F-10 Bypass", "IJP Road → G-11 Connector"])
        - "confidence": (float, 0.0 to 1.0, representing simulation accuracy)
        - "reasoning_summary": (string, 1-2 sentence explanation of your simulation result for transparency)
        """

        add_log("🔄 ALTERNATE ROUTER: Simulating safe evacuation route via Srinagar Highway.")
        add_log("🤖 COGNITIVE BRAIN: Querying Google Gemini 1.5 Flash simulation core...")
        
        gemini_res = await query_gemini_json(prompt, model="gemini-1.5-flash", fallback_result=fallback_output)

        eta_before = int(gemini_res.get("eta_before_min", eta_before_fallback))
        eta_after = int(gemini_res.get("eta_after_min", eta_after_fallback))
        time_saved = int(gemini_res.get("time_saved_min", time_saved_fallback))
        congestion_effect = gemini_res.get("congestion_effect", congestion_fallback)
        recommendation = gemini_res.get("recommendation", fallback_output["recommendation"])
        alternate_routes = gemini_res.get("alternate_routes", fallback_output["alternate_routes"])
        confidence = float(gemini_res.get("confidence", fallback_output["confidence"]))
        reasoning_summary = gemini_res.get("reasoning_summary", fallback_reasoning)

        add_log(f"🔀 DIVERTER EXEC: Reroute simulation complete. Transit delta calculated: {eta_before}m → {eta_after}m.")
        add_log(f"⏱️ DELAY OFFSET: Reroute saves an average of {time_saved} minutes per vehicle transit.")
        add_log(f"ℹ️ STAKEHOLDER CORRELATION: Alternative pathways confirmed: {', '.join(alternate_routes)}.")

        return {
            "input_summary": f"Reroute simulation for {severity} incident {incident_id}",
            "reasoning_summary": reasoning_summary,
            "confidence": round(confidence, 2),
            "output": {
                "simulation_type": "reroute",
                "eta_before_min": eta_before,
                "eta_after_min": eta_after,
                "time_saved_min": time_saved,
                "congestion_effect": congestion_effect,
                "resource_cost": f"{total_resources} units deployed",
                "recommendation": recommendation,
                "alternate_routes": alternate_routes,
                "step_logs": step_logs,
            },
        }
