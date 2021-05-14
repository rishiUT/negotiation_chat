# negotiation_chat

This project explores how speech data captures cues that are lost during transcription to a written format in negotiaton dialogues.
It is built using the parlai_chat_task_demo in Mephisto/examples.

Here's how the final app should look like:

When the app launches on mTurk, the workers will be shown the basic instructions and requirements for the task on the preview screen. If the workers wish to proceed with the task, they will click the "Accept" button at the bottom right corner of the screen.

Clicking the "Accept" button will lead a worker to the main screen of the task. On this page, the worker will see the Detailed Instructions on the left pane. Towards the center of the screen, they will be shown a message indicating that they are being paired with another worker for the task.

Once two workers are paired together, they can click on the "Item Details" button which will show them a description of the item that they will be negotiating the price for. The buyer will also be shown a target price unknown to the seller. All the information about the item will be shown on the center bottom of the page. 

When the workers are ready to negotiate, they will click the "Call" button on the top right corner of the screen (next to the volume and connect status button). Clicking on the call button will launch an overlay. This overlay will have a PeerId for each of the two workers and a text box for the workers to share their PeerId with each other. Once the PeerId is shared, the status on the overlay will display a message indicating that the workers are now connected for a call. At this point, the workers can click the record button which will start the recording of the audio call. The workers can then continue with the negotiation. After they are done negotiating, the workers can click the Stop button which will Stop the recording and close the overlay.

Each of the workers will then enter a concluding line in the text box given to them on the top center of the screen and press Send (An example of a concluding line is given to the workers as part of the Detailed Instructions). This concluding line will include the final price that they agreed to the trade the item for. After this, the workers can simply click the Return button at the bottom right corner of the screen to end the task.

