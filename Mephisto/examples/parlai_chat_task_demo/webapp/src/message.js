import React from "react";
import { useState } from "react";
import ReactDOM from "react-dom";

const Message = props => {
  //const [content, setContent] = useState(props.content)

  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={props.handleClose}>x</span>
        {props.content}
      </div>
    </div>
  );
};
 
export default Message;