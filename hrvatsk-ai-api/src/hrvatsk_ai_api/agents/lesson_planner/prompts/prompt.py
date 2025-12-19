from .agent import SYSTEM_PROMPT


class Prompt:
    def __init__(self, name, prompt) -> None:
        self.name = name
        self.prompt = prompt

    def __str__(self) -> str:
        return self.prompt

    def __repr__(self) -> str:
        return self.__str__()


system_prompt = Prompt(name="agent_system_prompt", prompt=SYSTEM_PROMPT)
