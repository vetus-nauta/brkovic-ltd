<div id='terminal' contenteditable='true' style='width: 100%; height: 300px; background-color: black; color: white; padding: 10px; font-family: monospace; border: 1px solid #444; overflow-y: scroll;' placeholder='Enter your command...'></div>
<button onclick='executeCommand(document.getElementById("terminal").innerText)'>Run Command</button>
<pre id='output'></pre>
<textarea id='terminal' style='width: 100%; height: 300px; background-color: black; color: white; padding: 10px; font-family:monospace; border: 1px solid #444; overflow-y: scroll;' placeholder='Enter your command...'></textarea>
<button onclick='executeCommand(document.getElementById("terminal").value)'>Run Command</button>
<pre id='output'></pre>
