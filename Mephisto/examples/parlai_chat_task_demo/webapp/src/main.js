/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React, { useState, useEffect } from "react";
import ReactDOM, { render } from "react-dom";
import "bootstrap-chat/styles.css";
//import "../../../packages/bootstrap-chat/styles.css";
import { Storage } from 'aws-amplify'

import { ChatApp, ChatMessage, DefaultTaskDescription } from "bootstrap-chat";
//import { ChatApp, ChatMessage, DefaultTaskDescription } from "../../../packages/bootstrap-chat";

function RenderChatMessage({ message, mephistoContext, appContext, idx }) {
  const { agentId } = mephistoContext;
  const { currentAgentNames } = appContext.taskContext;

  return (
    <div onClick={() => alert("You clicked on message with index " + idx)}>
      <ChatMessage
        isSelf={message.id === agentId || message.id in currentAgentNames}
        agentName={
          message.id in currentAgentNames
            ? currentAgentNames[message.id]
            : message.id
        }
        message={message.text}
        taskData={message.task_data}
        messageId={message.message_id}
      />
    </div>
  );
}

function MainApp() {
  const [fileUrl, setFileUrl] = useState('');
  useEffect(() => {
    Storage.get('data.json')
      .then(data => {
        setFileUrl('data')
      })
      .catch(err => {
        console.log('error fetching file')
      })
  }); 
  return (
    <ChatApp
      renderMessage={({ message, idx, mephistoContext, appContext }) => (
        <RenderChatMessage
          message={message}
          mephistoContext={mephistoContext}
          appContext={appContext}
          idx={idx}
          key={message.message_id + "-" + idx}
        />
      )}
      renderSidePane={({ mephistoContext: { taskConfig } }) => (
        <DefaultTaskDescription
          chatTitle="Detailed Instructions"
          taskDescriptionHtml="When you are finished, please press the button."
        >
          <html>
            <p> Here's a description and the listing price of the product on Craigslist:</p>
            <br />
            <head>
            <script>var loaded = false;</script>
              <script src="http://code.jquery.com/jquery-latest.js"></script>
              <script type="text/javascript" src="data.json"></script>
              <script src="items.js" onLoad="alert('Script loaded!');
              loaded=true;"></script>
              <script>$(document).ready(randomItem);</script>
            </head>
            <body>
              <div id = "display" ></div> 
              <input type = "button" onclick="randomItem()" value = "Item details" />
            </body>
            <br />
            <ul>
            <li>You and the other worker will take turns to speak the dialogue corresponding to your role.</li>
            <li>Please press the <b>Record</b> button only if it is your turn to speak. Then, speak in a persuasive manner with the goal of convincing the other worker and reaching an agreement.</li>
            <li>As soon as you finish speaking, please press the <b>Pause</b> button to let the other worker speak.</li>
            <li>When the other worker and you reach an agreement on the sale of an item, please press the <b>Stop</b> button to end the recording.</li>
            </ul>
            <br />
            <p><b>Buyers:</b>
              <br/>
              <p>Please enter one of the following statements in the chat box at the bottom of the page and press <b>Send</b>:
                <ul>
                <li>If you have decided to <b>purchase</b> the item: <b>"I accept the purchase of the listed item at [OFFER PRICE].”</b></li>
                <li>If you have decided to <b>not purchase</b> the item: <b>"I do not accept the purchase of the listed item at [OFFER PRICE]. Thank you for your time.”</b></li>   
                </ul>
              </p>
            </p>
            <br />
            <p><b>Sellers:</b>
            <br />
            <p>Please enter one of the following statements in the chat box at the bottom of the page and press <b>Send</b>:
              <ul>
              <li>If you have decided to <b>sell</b> the item: <b>"I accept the sale of the listed item at [OFFER PRICE].”</b></li>
              <li>If you have decided to <b>not sell</b> the item: <b>"I do not accept the sale of the listed item at [OFFER PRICE]. Thank you for your time.”</b></li>   
              </ul>
            </p>
          </p>
          </html>
        </DefaultTaskDescription>
      )}
    />
  );
}

ReactDOM.render(<MainApp />, document.getElementById("app"));
