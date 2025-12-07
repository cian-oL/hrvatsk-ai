from langraph.graph import MessageState


class AgentState(MessageState):
    summary: str
