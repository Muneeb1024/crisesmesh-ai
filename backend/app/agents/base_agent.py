"""
CrisesMesh AI — Base Agent
Abstract base for all CrisesMesh agents.
Each agent produces a safe reasoning summary (never raw chain-of-thought).
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from datetime import datetime, timezone
import time
import uuid


class AgentTrace:
    """Immutable record of one agent execution. Stored for government transparency."""

    def __init__(
        self,
        agent_name: str,
        incident_id: str,
        input_summary: str,
        reasoning_summary: str,
        output: Dict[str, Any],
        confidence: float,
        execution_ms: int,
    ):
        self.id = f"trace_{uuid.uuid4().hex[:12]}"
        self.agent_name = agent_name
        self.incident_id = incident_id
        self.input_summary = input_summary
        self.reasoning_summary = reasoning_summary  # Safe summary only
        self.output = output
        self.confidence = confidence
        self.execution_ms = execution_ms
        self.created_at = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "agent_name": self.agent_name,
            "incident_id": self.incident_id,
            "input_summary": self.input_summary,
            "reasoning_summary": self.reasoning_summary,
            "output": self.output,
            "confidence": self.confidence,
            "execution_ms": self.execution_ms,
            "created_at": self.created_at.isoformat(),
        }


class BaseAgent(ABC):
    """
    Abstract base agent for CrisesMesh AI multi-agent pipeline.

    Each agent:
    1. Receives structured input
    2. Processes via Gemini/ADK (or mock for skeleton)
    3. Returns structured output + safe reasoning summary
    4. Generates an AgentTrace record
    """

    name: str = "BaseAgent"
    description: str = "Base agent"

    @abstractmethod
    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        """
        Core processing logic. Subclasses implement this.
        Returns: {"output": {...}, "reasoning_summary": str, "confidence": float}
        """
        pass

    async def run(self, input_data: Dict[str, Any], incident_id: str) -> AgentTrace:
        """
        Execute the agent and return a trace record.
        This is the public API — wraps process() with timing and trace generation.
        """
        start = time.perf_counter()

        result = await self.process(input_data, incident_id)

        elapsed_ms = int((time.perf_counter() - start) * 1000)

        trace = AgentTrace(
            agent_name=self.name,
            incident_id=incident_id,
            input_summary=result.get("input_summary", f"Processed {len(input_data)} inputs"),
            reasoning_summary=result.get("reasoning_summary", "No summary provided"),
            output=result.get("output", {}),
            confidence=result.get("confidence", 0.5),
            execution_ms=elapsed_ms,
        )

        return trace
