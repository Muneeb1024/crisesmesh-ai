"""
CrisesMesh AI — Agent Orchestrator
Runs the full 7-agent pipeline for an incident.
"""

from typing import Any, Dict, List
from app.agents.base_agent import AgentTrace
from app.agents.signal_fusion import SignalFusionAgent
from app.agents.classification import ClassificationAgent
from app.agents.severity import SeverityAgent
from app.agents.resource_allocation import ResourceAllocationAgent
from app.agents.simulation import SimulationAgent
from app.agents.notification import NotificationAgent
from app.agents.recovery import RecoveryAgent


class AgentOrchestrator:
    """
    Runs all 7 agents in sequence for a given incident.
    Each agent receives output from previous agents as context.
    """

    def __init__(self):
        self.agents = [
            SignalFusionAgent(),
            ClassificationAgent(),
            SeverityAgent(),
            ResourceAllocationAgent(),
            SimulationAgent(),
            NotificationAgent(),
            RecoveryAgent(),
        ]

    async def run_pipeline(
        self, incident_id: str, signals: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Execute full agent pipeline.
        Returns: {"traces": [...], "final_output": {...}}
        """
        traces: List[AgentTrace] = []
        context: Dict[str, Any] = {"signals": signals}

        # 1. Signal Fusion
        fusion_trace = await self.agents[0].run(context, incident_id)
        traces.append(fusion_trace)
        context["fusion_result"] = fusion_trace.output

        # 2. Classification
        classification_trace = await self.agents[1].run(context, incident_id)
        traces.append(classification_trace)
        context["classification_result"] = classification_trace.output

        # 3. Severity
        severity_trace = await self.agents[2].run(context, incident_id)
        traces.append(severity_trace)
        context["severity_result"] = severity_trace.output

        # 4. Resource Allocation
        allocation_trace = await self.agents[3].run(context, incident_id)
        traces.append(allocation_trace)
        context["allocation_result"] = allocation_trace.output

        # 5. Simulation
        simulation_trace = await self.agents[4].run(context, incident_id)
        traces.append(simulation_trace)
        context["simulation_result"] = simulation_trace.output

        # 6. Notification
        notification_trace = await self.agents[5].run(context, incident_id)
        traces.append(notification_trace)
        context["notification_result"] = notification_trace.output

        # 7. Recovery
        recovery_trace = await self.agents[6].run(context, incident_id)
        traces.append(recovery_trace)
        context["recovery_result"] = recovery_trace.output

        return {
            "incident_id": incident_id,
            "traces": [t.to_dict() for t in traces],
            "agent_count": len(traces),
            "pipeline_status": "complete",
            "final_output": {
                "fusion": fusion_trace.output,
                "classification": classification_trace.output,
                "severity": severity_trace.output,
                "allocation": allocation_trace.output,
                "simulation": simulation_trace.output,
                "notification": notification_trace.output,
                "recovery": recovery_trace.output,
            },
        }


# Global singleton
orchestrator = AgentOrchestrator()
