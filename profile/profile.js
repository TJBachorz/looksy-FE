const $ = {
    menu: document.querySelector('.ham-menu'),
    uploadURL: "https://looksy-file-uploader.herokuapp.com/upload",
    baseURL: "https://looksy-backend.herokuapp.com",
    userId: null,
    upload: document.querySelector('#photo-upload-form')
}

const queryParams = new URLSearchParams(window.location.search)
$.userId = queryParams.get('user_id')
$.menu.addEventListener('click', animateMenu)

fetch(`${$.baseURL}/users/${$.userId}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    }
})
    .then(parseResponse)
    .then(displayProfile)

function displayProfile(user) {
    createWelcomeMessage(user)
    createMenu()
    renderUserAvatar(user)
    renderBio(user)
    const editButton = document.querySelector('.edit-button')
    editButton.addEventListener('click', (event) => renderBioForm(user))
    $.upload.addEventListener('submit', (event) => uploadFile(event, user))
}

function renderBioForm(user) {
    toggleEditButton()
    const bioFormDiv = document.querySelector('#bio-form-div')
    createBioTextArea(bioFormDiv, user)
}

function createBioTextArea(div, user) {
    const bioForm = document.createElement('form')
    bioForm.classList.add("user-bio-form")
    div.appendChild(bioForm)
    const bioTextArea = renderTextArea(user)
    const saveButton = renderSaveButton()
    bioForm.append(bioTextArea, saveButton)
    bioForm.addEventListener('submit', (event) => updateUserBio(event, user))
    return bioForm
}

function renderSaveButton() {
    const saveButton = document.createElement('button')
    saveButton.type = "submit"
    saveButton.textContent = "Save"
    saveButton.classList.add("bio-save-button")
    return saveButton
}

function renderTextArea(user) {
    const textArea = document.createElement('textarea')
    textArea.value = document.querySelector('#bio').textContent
    textArea.name = "bio"
    textArea.classList.add('bio-text-area') 
    return textArea
}

function toggleEditButton() {
    document.querySelector('.edit-button').classList.toggle('hidden')
}

function updateUserBio(event, user) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const bioData = formData.get('bio')
    fetch(`${$.baseURL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            user: {
                bio: bioData
            }
        })
    }).then(parseResponse)
    .then(renderBio)
    defaultBioLook()
}

function defaultBioLook() {
    document.querySelector('.user-bio-form').remove()
    document.querySelector('.edit-button').classList.toggle('hidden')
}

function renderBio(user) {
    const bio = document.querySelector('#bio')
    if (user.bio == null || user.bio.length == 0) {
        bio.innerHTML = `<em>No user bio, click 'Edit Bio' to make one</em>`
    } else {
        bio.innerHTML = user.bio
    }
}

function renderUserAvatar(user) {
    const img = document.querySelector('#avatar')
    if (user.image) {
        img.src = user.image
    } else {
        img.src = "https://www.pngitem.com/pimgs/m/504-5040528_empty-profile-picture-png-transparent-png.png"
    }
}

function createMenu() {
    const profileLink = document.createElement('li')
    const homeLink = document.querySelector('.nav-links').firstElementChild
    const logoutLink = document.createElement('li')
    const lastLink = document.querySelector('.nav-links').lastElementChild
    profileLink.innerHTML = `<a href="../profile/profile.html?user_id=${localStorage.getItem('id')}" class="link">My Profile</a>`
    logoutLink.innerHTML = `<a href="/" class="link">Logout</a>`
    homeLink.insertAdjacentElement('afterend', profileLink)
    lastLink.insertAdjacentElement('afterend', logoutLink)
    logoutLink.addEventListener('click', logout)
}

async function createWelcomeMessage(user) {
    const titleContainer = document.querySelector('.title-card')
    const welcome = document.querySelector('.welcome-user')
    welcome.textContent = `Welcome ${user.username}!`
    titleContainer.append(welcome)
}

function uploadFile(event, user) {
    event.preventDefault()
    const $message = document.querySelector("#message");
    const formData = new FormData(event.target)
    fetch($.uploadURL, {
        method: "POST",
        body: formData
    }).then(parseResponse)
    .then(({data, error}) => {
        updateUserImage(data, user)
        .then(parseResponse)
        .then(renderUpdatedImage)
    })
}

function renderUpdatedImage(user) {
    const img = document.querySelector('#avatar')
    img.src = user.image
    img.alt = `${user.username}'s profile picture`
}

async function updateUserImage(data, user) {
    return fetch(`${$.baseURL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            user: {
                image: data
            }
        })
    })
}

function contactOverlay() {
    const overlay = document.querySelector('#contact-overlay')
    if (overlay.style.display === "flex") {
        overlay.style.display = "none"
    } else {
    overlay.style.display = "flex"
    }
}

function logout() {
    localStorage.clear()
}

function parseResponse(response) {
    return response.json()
}

function animateMenu() {
    $.menu.classList.toggle("animated")
    document.querySelector('#nav-links').classList.toggle("animated")
    document.querySelector('.menu-bg').classList.toggle("animated-bg")
}