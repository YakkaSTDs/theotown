document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                // Find the appropriate container for the buttons
                const buttonContainer = document.getElementById(item['btn container id']);

                if (!buttonContainer) {
                    console.error(`Button container with id ${item['btn container id']} not found.`);
                    return;
                }

                // Check if the item is a modal or a link button
                if (item.content) {
                    // Create a button for each modal
                    const button = document.createElement('button');
                    button.className = 'btn btn-sm btn-outline-light rounded-0 mb-1 mr-1';
                    button.innerText = item['btn title'];
                    button.setAttribute('data-bs-toggle', 'modal');
                    button.setAttribute('data-bs-target', `#${item.id}`);
                    buttonContainer.appendChild(button);

                    // Create a modal for each item
                    const modal = document.createElement('div');
                    modal.className = 'modal yk-modal-blur fade';
                    modal.id = item.id;
                    modal.tabIndex = -1;
                    modal.setAttribute('aria-labelledby', `${item.id}Label`);
                    modal.setAttribute('aria-hidden', 'true');

                    // Fetch the content of the modal from the provided URL
                    fetch(item.content)
                        .then(response => response.text())
                        .then(htmlContent => {
                            modal.innerHTML = `
                                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div class="modal-content yk-modal">
                                        <div class="modal-header px-2 yk-modal-header">
                                      <div class="row gx-1 w-100">
                                        <div class="col-11"><h4 class="modal-title text-start px-1" id="${item.id}Label">${item.title}</h4></div>
                                        <div class="col-1">
                                          <button type="button" class="btn btn-sm yk-btn-close" data-bs-dismiss="modal" aria-label="Close"><i class="bi bi-x-lg"></i></button>
                                        </div>
                                      </div>
                                        </div>
                                        <div class="modal-body yk-modal-body">
                                            ${htmlContent}
                                        </div>
                                    </div>
                                </div>
                            `;
                            // Append the modal to the modal container
                            document.getElementById('modalContainer').appendChild(modal);
                        })
                        .catch(error => console.error(`Error loading content for modal ${item.id}:`, error));
                } else if (item.url) {
                    // Create a button that links to an external URL
                    const linkButton = document.createElement('a');
                    linkButton.className = 'btn btn-sm btn-outline-light rounded-0 mb-1 mr-1';
                    linkButton.innerText = item['btn title'];
                    linkButton.href = item.url;
                    linkButton.target = "_blank"; // Open in a new tab
                    buttonContainer.appendChild(linkButton);
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});