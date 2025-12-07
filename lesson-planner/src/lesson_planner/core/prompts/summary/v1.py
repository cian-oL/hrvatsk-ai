"""
Summarization Prompts for the Agent.
"""

# ===================
# ===== PROMPTs =====
# ===================

SUMMARY_PROMPT = """
Create a summary of the conversation between the agent and the user.
The summary must be a short description of the conversation so far, but that also captures all the
relevant information shared between Satoshi and the user:
"""

EXTEND_SUMMARY_PROMPT = """
This is a summary of the conversation to date between the agent and the user:

{{summary}}

Extend the summary by taking into account the new messages above:
"""
