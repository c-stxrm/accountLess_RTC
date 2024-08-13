//connection to the websocket
    //link processing
    console.log(window.location.href);
    const current_adress = window.location.href
    const current_host = new URL(current_adress);
    WebSocket_adress = ('ws://'+current_host.hostname+':500')
    console.log(WebSocket_adress)

const socket = new WebSocket(WebSocket_adress);
//major elements
const button = document.getElementById("send_msg");
button.disabled = true;
//general functions
function checkInput() {
    const button = document.getElementById("send_msg");
    const username = document.getElementById("username_input").value.trim();
    const message = document.getElementById("message_input").value.trim();  
    const isValid = username.length > 0 && message.length > 0;
    button.disabled = !isValid;
    //console.log(isValid ? "enabled" : "disabled");
    return isValid;
}

//general event listeners
    //keypress enter linking
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                button.click();
            }
        });
    //whenever a key is pressed check the input
        document.getElementById("username_input").addEventListener('input', (e) =>{
            checkInput();
        })
        document.getElementById("message_input").addEventListener('input', (e) =>{
            checkInput();
        })

//when socket open 
socket.onopen = (event) =>{
    console.log("socket connected")
    //sending message
        button.addEventListener("click", () =>{
            var username = document.getElementById("username_input").value;
            var message = document.getElementById("message_input").value
            var canal = document.getElementById("canal_input").value
            //temporary check username
            if (checkInput() === true) {
                socket.send(JSON.stringify(
                    {
                        "type": "message",
                        "username": username,
                        "message": message,
                        "canal": canal,
                    }
                ));
            } else if(checkInput != true) {
                const alert = document.createElement("div");
                alert.className = "alert alert-danger d-flex align-items-center";
                alert.role = "alert"
                alert.innerHTML = 
                    `
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                        <use xlink:href="#exclamation-triangle-fill"/>
                    </svg><div>message or username not filled in</div>
                    `
                document.getElementById("msg_box").appendChild(alert);                
                
            }
            
        });
        //select automatically a canal as you tip in
        document.getElementById("canal_input").addEventListener('focus', (e)=>{
            current_canal = document.getElementById("canal_input").value
        })
        document.getElementById("canal_input").addEventListener('focusout', (e) =>{
            var canal = document.getElementById("canal_input").value
            if(current_canal != canal){
                //display message
                const alert = document.createElement("div");
                alert.className = "alert alert-info d-flex align-items-center";
                alert.role = "alert"
                alert.innerHTML = 
                        `
                        <div>you're now on a new private channel : ${canal}</div>
                        `
                document.getElementById("msg_box").appendChild(alert);                

                socket.send(JSON.stringify(
                    {
                        "type": "canal",
                        "canal": canal,
                    }
                ));
            }
        })
    //recieving msg
    socket.onmessage = (event) =>{
        const data = JSON.parse(event.data);
        if(data.type === "message" && data.canal === '' && document.getElementById("canal_input").value === ''){
            //remove place holder
                const removable = document.getElementById("placeholder_no_msg");
                if (typeof(removable) != 'undefined' && removable != null)
                {
                    removable.remove();
                }
            
                document.scrollingElement.scroll(0, 1);
            //creating msg
                const message = document.createElement("p");
                message.className = "p-2";
                message.innerHTML = `<div class="card p-2"><p><b>${data.username}</b>: ${data.message}</p></div>`
                document.getElementById("msg_box").appendChild(message);
        } else if(data.type === "message" && data.canal != ''){
            console.log("message on canal :", data.canal);
            //remove place holder
                const removable = document.getElementById("placeholder_no_msg");
                if (typeof(removable) != 'undefined' && removable != null)
                {
                    removable.remove();
                }
            
                document.scrollingElement.scroll(0, 1);
            //creating msg
                current_canal = document.getElementById("canal_input").value    
                const message = document.createElement("p");
                message.className = "p-2";
                message.innerHTML = `<div class="card p-2"><p><b>PRIVATE CANAL - ${current_canal} - : ${data.username}</b>: ${data.message}</p></div>`
                document.getElementById("msg_box").appendChild(message);
        }
    }
    
}

socket.onclose = (event) =>{
    console.error(" client/server error. you have been disconnected");
    const alert = document.createElement("div");
    alert.className = "alert alert-danger d-flex align-items-center";
    alert.role = "alert"
    alert.innerHTML = 
        `
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
            <use xlink:href="#exclamation-triangle-fill"/>
        </svg><div>ERROR : client/server error. you have been disconnected</div>
        `
    document.getElementById("msg_box").appendChild(alert); 

    
}

socket.connect_timeout = (event) =>{
    console.error("client/server error. connection timeout");
}