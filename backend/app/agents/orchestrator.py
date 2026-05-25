"""
CrisesMesh AI — Agent Orchestrator
Runs the full 8-agent pipeline for an incident.
Order: Signal Fusion → Vetting → Classification → Severity → Resource Allocation → Simulation → Translation → Notification
"""

from typing import Any, Dict, List
from app.agents.base_agent import AgentTrace
from app.agents.signal_fusion import SignalFusionAgent
from app.agents.vetting import VettingAgent
from app.agents.classification import ClassificationAgent
from app.agents.severity import SeverityAgent
from app.agents.resource_allocation import ResourceAllocationAgent
from app.agents.simulation import SimulationAgent
from app.agents.translation import TranslationAgent
from app.agents.notification import NotificationAgent


class AgentOrchestrator:
    """
    Runs all 8 agents in sequence for a given incident.
    Each agent receives output from previous agents as context.
    Pipeline: Signal Fusion → Vetting → Classification → Severity → Resource Allocation → Simulation → Translation → Notification
    """

    def __init__(self):
        self.signal_fusion = SignalFusionAgent()
        self.vetting = VettingAgent()
        self.classification = ClassificationAgent()
        self.severity = SeverityAgent()
        self.resource_allocation = ResourceAllocationAgent()
        self.simulation = SimulationAgent()
        self.translation = TranslationAgent()
        self.notification = NotificationAgent()

    async def run_pipeline(
        self, incident_id: str, signals: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Execute full 8-agent pipeline.
        Returns: {"traces": [...], "final_output": {...}}
        """
        traces: List[AgentTrace] = []
        context: Dict[str, Any] = {"signals": signals}

        # 1. Signal Fusion — fuse all incoming signals
        fusion_trace = await self.signal_fusion.run(context, incident_id)
        traces.append(fusion_trace)
        context["fusion_result"] = fusion_trace.output

        # 2. Vetting — validate report credibility (never blocks, returns score)
        vetting_trace = await self.vetting.run(context, incident_id)
        traces.append(vetting_trace)
        context["vetting_result"] = vetting_trace.output

        # 3. Classification — determine crisis type
        classification_trace = await self.classification.run(context, incident_id)
        traces.append(classification_trace)
        context["classification_result"] = classification_trace.output

        # 4. Severity — assess severity level and priority score
        severity_trace = await self.severity.run(context, incident_id)
        traces.append(severity_trace)
        context["severity_result"] = severity_trace.output

        # 5. Resource Allocation — assign teams and resources
        allocation_trace = await self.resource_allocation.run(context, incident_id)
        traces.append(allocation_trace)
        context["allocation_result"] = allocation_trace.output

        # 6. Simulation — predict future impact and recommend actions
        simulation_trace = await self.simulation.run(context, incident_id)
        traces.append(simulation_trace)
        context["simulation_result"] = simulation_trace.output

        # 7. Translation — generate bilingual EN/UR alerts
        translation_trace = await self.translation.run(context, incident_id)
        traces.append(translation_trace)
        context["translation_result"] = translation_trace.output

        # 8. Notification — broadcast alerts to citizens
        notification_trace = await self.notification.run(context, incident_id)
        traces.append(notification_trace)
        context["notification_result"] = notification_trace.output

        return {
            "incident_id": incident_id,
            "traces": [t.to_dict() for t in traces],
            "agent_count": len(traces),
            "pipeline_status": "complete",
            "final_output": {
                "fusion": fusion_trace.output,
                "vetting": vetting_trace.output,
                "classification": classification_trace.output,
                "severity": severity_trace.output,
                "allocation": allocation_trace.output,
                "simulation": simulation_trace.output,
                "translation": translation_trace.output,
                "notification": notification_trace.output,
            },
        }


# Global singleton
orchestrator = AgentOrchestrator()
