document.addEventListener("DOMContentLoaded", function() {
    const outputDiv = document.getElementById("output");
    const userInput = document.getElementById("user-input");
    const prefix = document.getElementById("prefix");

    let commandPrefix = "$"; // Default command prefix

    fetch("data.json")
        .then(response => response.json())
        .then(commands => {
            userInput.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    const inputValue = userInput.value.trim();
                    if (containsHtmlOrScript(inputValue)) {
                        output(`<p class="errorcmdnf">Apa yang kamu lakukan? Anda seharusnya tidak mengetik itu.<br> Cek daftar perintah menggunakan ${commandPrefix}list cok.</p>`);
                    } else {
                        displayCommand(inputValue);
                        processCommand(inputValue, commands);
                    }
                    userInput.value = ""; // Clear input
                }
            });
        });

    function containsHtmlOrScript(text) {
        const htmlPattern = /<\/?[a-z][\s\S]*>/i; // Basic pattern to detect HTML tags
        const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/i; // Detect script tags
        return htmlPattern.test(text) || scriptPattern.test(text);
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#039;");
    }

    function displayCommand(commandLine) {
        const commandDisplay = document.createElement('p');
        commandDisplay.textContent = `${commandPrefix} ${escapeHtml(commandLine)}`;
        commandDisplay.className = 'pvcmd'; // Apply class for previous command
        outputDiv.appendChild(commandDisplay);
    }

    function processCommand(commandLine, commands) {
        const [command, ...args] = commandLine.split(" ");
        const cmd = commands.find(c => c.command === command);

        if (!cmd) {
            output(`<p class="errorcmdnf">Perintah ${escapeHtml(command)} tidak ditemukan!<br>Cek lagi menggunakan <span class="txtinv">${commandPrefix}list</span></p>`);
            return;
        }

        // Handle specified commands with extensions
        if (cmd.specify && args.length > 0) {
            const specifyCmd = cmd.specify.find(s => s.extension === args[0].replace("--", ""));
            if (specifyCmd) {
                if (specifyCmd.url.startsWith("http")) {
                    handleExternalUrl(specifyCmd.url);
                } else {
                    fetchContent(specifyCmd.url, command, true); // Local content
                }
            } else {
                output(`<p class="errorcmdnf">Spesifikasi perintah tidak valid: ${escapeHtml(args[0])}</p>`);
            }
        } else {
            if (cmd.url.startsWith("http")) {
                handleExternalUrl(cmd.url);
            } else {
                fetchContent(cmd.url, command, true); // Local content
            }
        }
    }

    function handleExternalUrl(url) {
        const mediaExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const isMedia = mediaExtensions.some(ext => url.endsWith(ext));
        if (isMedia) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = "Media content";
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            outputDiv.appendChild(img);
        } else {
            window.location.href = url;
        }
    }

    function fetchContent(url, command, isLocal) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("404");
                }
                return response.text();
            })
            .then(text => {
                if (isLocal) {
                    // Allow HTML injection for local content
                    const contentDiv = document.createElement("div");
                    contentDiv.innerHTML = text; // Directly set HTML content
                    outputDiv.appendChild(contentDiv);
                } else {
                    // Escape HTML for external content
                    const escapedText = escapeHtml(text);
                    const contentDiv = document.createElement("div");
                    contentDiv.textContent = escapedText;
                    outputDiv.appendChild(contentDiv);
                }
                scrollToBottom();
            })
            .catch(error => {
                if (error.message === "404") {
                    output(`<p class="error404">404 file untuk ${escapeHtml(command)} tidak ditemukan,kontak pemilik!</p>`);
                } else {
                    output(`<span class="error404">Error memuat konten untuk ${escapeHtml(command)}</span>`);
                }
            });
    }

    function output(htmlContent) {
        const pre = document.createElement("pre");
        pre.innerHTML = htmlContent; // Use innerHTML to render HTML content
        outputDiv.appendChild(pre);
        scrollToBottom();
    }

    function scrollToBottom() {
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    prefix.textContent = commandPrefix; // Set the prefix in the terminal UI
});