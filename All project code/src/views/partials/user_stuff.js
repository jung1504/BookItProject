const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.





ul.addEventListiner("click", (event) => {
    if(event.target.tagname == "BUTTON"){
        const button = event.target;
        const li = button.parentNode;
        const ul = li.parentNode;
        if(button.textContent == "EDIT"){
            const span = li.firstElementChild;
            const input = document.createElement("input");
            input.type = "text";
            input.value = span.textContent;
            li.insertBefore(input, span);
            li.removeChild(span);
            button.textContent = "SAVE";
        } 
        else if(button.textContent == "SAVE"){
            const input = li.firstElementChild;
            const span = document.createElement("span");
            span.textContent = input.value;
            li.insertBefore(span, input);
            li.removeChild(input);
            button.textContent = "edit";
        }
    }



});