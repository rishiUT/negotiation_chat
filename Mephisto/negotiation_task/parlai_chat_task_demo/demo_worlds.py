#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
from parlai.crowdsourcing.utils.worlds import CrowdOnboardWorld, CrowdTaskWorld
from parlai.core.worlds import validate
from joblib import Parallel, delayed


class MultiAgentDialogOnboardWorld(CrowdOnboardWorld):
    def __init__(self, opt, agent):
        super().__init__(opt, agent)
        self.opt = opt

    def parley(self):
        self.agent.agent_id = "Onboarding Agent"
        self.agent.observe({"id": "System", "text": "Welcome onboard!"})
        x = self.agent.act(timeout=self.opt["turn_timeout"])
        self.agent.observe(
            {
                "id": "System",
                "text": "Thank you for your input! Please wait while "
                "we match you with another worker...",
                "episode_done": True,
            }
        )
        self.episodeDone = True


class MultiAgentDialogWorld(CrowdTaskWorld):
    """
    Basic world where each agent gets a turn in a round-robin fashion, receiving as
    input the actions of all other agents since that agent last acted.
    """

    def __init__(self, opt, agents=None, shared=None):
        # Add passed in agents directly.
        self.agents = agents
        self.acts = [None] * len(agents)
        self.episodeDone = False
        self.max_turns = opt.get("max_turns", 20)
        self.current_turns = 0
        self.send_task_data = opt.get("send_task_data", False)
        self.opt = opt
        for idx, agent in enumerate(self.agents):
            agent.agent_id = f"Chat Agent {idx + 1}"

    def parley(self):
        """
        For each agent, get an observation of the last action each of the other agents
        took.
        Then take an action yourself.
        """
        acts = self.acts
        self.current_turns += 1
        for index, agent in enumerate(self.agents):
            try:
                acts[index] = agent.act(timeout=self.opt["turn_timeout"])
                if self.send_task_data:
                    acts[index].force_set(
                        "task_data",
                        {
                            "last_acting_agent": agent.agent_id,
                            "current_dialogue_turn": self.current_turns,
                            "utterance_count": self.current_turns + index,
                        },
                    )
            except TypeError:
                acts[index] = agent.act()  # not MTurkAgent
            if acts[index]["episode_done"]:
                self.episodeDone = True
            for other_agent in self.agents:
                if other_agent != agent:
                    other_agent.observe(validate(acts[index]))
        if self.current_turns >= self.max_turns:
            self.episodeDone = True
            for agent in self.agents:
                agent.observe(
                    {
                        "id": "Coordinator",
                        "text": "Please fill out the form to complete the chat:",
                        "task_data": {
                            "respond_with_form": [
                                {
                                    "type": "choices",
                                    "question": "How much did you enjoy talking to this user?",
                                    "choices": [
                                        "Not at all",
                                        "A little",
                                        "Somewhat",
                                        "A lot",
                                    ],
                                },
                                {
                                    "type": "choices",
                                    "question": "Do you think this user is a bot or a human?",
                                    "choices": [
                                        "Definitely a bot",
                                        "Probably a bot",
                                        "Probably a human",
                                        "Definitely a human",
                                    ],
                                },
                                {"type": "text", "question": "Enter any comment here"},
                            ]
                        },
                    }
                )
                agent.act()  # Request a response
            for agent in self.agents:  # Ensure you get the response
                form_result = agent.act(timeout=self.opt["turn_timeout"])

    def prep_save_data(self, agent):
        """Process and return any additional data from this world you may want to store"""
        return {"example_key": "example_value"}

    def episode_done(self):
        return self.episodeDone

    def shutdown(self):
        """
        Shutdown all mturk agents in parallel, otherwise if one mturk agent is
        disconnected then it could prevent other mturk agents from completing.
        """
        global shutdown_agent

        def shutdown_agent(agent):
            try:
                agent.shutdown(timeout=None)
            except Exception:
                agent.shutdown()  # not MTurkAgent

        Parallel(n_jobs=len(self.agents), backend="threading")(
            delayed(shutdown_agent)(agent) for agent in self.agents
        )

    def get_instruction(self, agent_id=None, tag='first'):
        # assign roles based on which Turker connects first and second via agent_id
        if tag == 'identity':
            if (agent_id == 'Chat Agent 1'):
                agent_text = "You are randomly assigned to be the <span style=\"font-size: 20px;\"><b><i>BUYER</i></b></span> in this negotiation task.<br><br>As the buyer, your job is to persuade the seller (your co-worker) to sell the item shown above at the <span style=\"text-decoration: underline;\"> target price of <b>{$target_price}</b> </span> . As you can see, this target price is lower than the listing price of the item.<br><br> If you succeed in persuading your co-worker to sell the item at the target price, you will receive a bonus payment. You are not allowed to tell your co-worker the target price given to you or collude with them.</b></u></li></ul><br><br>You can refer to this link to see an example of a conversation where a buyer and a seller are negotiating on the price of a television set. <br><br><a href=\"https://www.savethechildren.org/\" target=\"_blank\">https://www.savethechildren.org/</a>"
                return persona_text
            else:
                persona_text = "You are randomly assigned to be the <span style=\"font-size: 20px;\"><b><i>SELLER</i></b></span> in this negotiation task.<br><br>As the seller, your job is to persuade the buyer (your co-worker) to purchase the item shown above at the <span style=\"text-decoration: underline;\"> listing price of <b>{$listing_price}</b> </span> .<br><br> If you succeed in persuading your co-worker to purchase the item at the listing price, you will receive a bonus payment. </b></u></li></ul><br><br>You can refer to this link to see an example of a conversation where a buyer and a seller are negotiating on the price of a television set. <br><br><a href=\"https://www.savethechildren.org/\" target=\"_blank\">https://www.savethechildren.org/</a>"
                return persona_text

def make_onboarding_world(opt, agent):
    return MultiAgentDialogOnboardWorld(opt, agent)


def validate_onboarding(data):
    """Check the contents of the data to ensure they are valid"""
    print(f"Validating onboarding data {data}")
    return True


def make_world(opt, agents):
    return MultiAgentDialogWorld(opt, agents)


def get_world_params():
    return {"agent_count": 2}
