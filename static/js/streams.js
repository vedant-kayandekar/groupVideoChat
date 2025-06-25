const APP_ID = 'bb70fcdb59ee4abca8258d9dc2fc265c';
const TOKEN = sessionStorage.getItem('token');
const CHANNEL = sessionStorage.getItem('room');
const UID = Number(sessionStorage.getItem('UID'));
const NAME = sessionStorage.getItem('name');

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL;

    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID);
    } catch (error) {
        console.error('Error joining channel:', error);
        window.open('/', '_self');
        return;
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    let member = await createMember();

    const player = `
        <div class="video-container" id="user-container-${UID}">
            <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
            <div class="video-player" id="user-${UID}"></div> 
        </div>`;
    
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);
    localTracks[1].play(`user-${UID}`);
    await client.publish([localTracks[0], localTracks[1]]);
};

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        let existingPlayer = document.getElementById(`user-container-${user.uid}`);
        if (existingPlayer) existingPlayer.remove();

        let member = await getMember(user);

        const player = `
            <div class="video-container" id="user-container-${user.uid}">
                <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                <div class="video-player" id="user-${user.uid}"></div> 
            </div>`;
        
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);
        user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
};

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];
    const userContainer = document.getElementById(`user-container-${user.uid}`);
    if (userContainer) userContainer.remove();
};

let leaveAndRemoveLocalStream = async () => {
    for (let track of localTracks) {
        track.stop();
        track.close();
    }

    await client.leave();
    await deleteMember();
    window.open('/', '_self');
};

let toggleCamera = async (e) => {
    const cameraTrack = localTracks[1];
    if (cameraTrack.muted) {
        await cameraTrack.setMuted(false);
        e.target.style.backgroundColor = '#fff';
    } else {
        await cameraTrack.setMuted(true);
        e.target.style.backgroundColor = 'rgb(255, 80, 80)';
    }
};

let toggleMic = async (e) => {
    const micTrack = localTracks[0];
    if (micTrack.muted) {
        await micTrack.setMuted(false);
        e.target.style.backgroundColor = '#fff';
    } else {
        await micTrack.setMuted(true);
        e.target.style.backgroundColor = 'rgb(255, 80, 80)';
    }
};

let createMember = async () => {
    let response = await fetch('/create_member/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: NAME, room_name: CHANNEL, UID: UID })
    });
    return await response.json();
};

let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`);
    let member = await response.json();
    console.log(member);
    return member;
};

let deleteMember = async () => {
    await fetch('/delete_member/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: NAME, room_name: CHANNEL, UID: UID })
    });
};

joinAndDisplayLocalStream();

window.addEventListener('beforeunload', deleteMember);
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggleMic);


// const APP_ID = 'bb70fcdb59ee4abca8258d9dc2fc265c' // Agora App ID
// const TOKEN = sessionStorage.getItem('token') // Token stored in session storage
// const CHANNEL = sessionStorage.getItem('room') // Channel name stored in session storage
// let UID = Number(sessionStorage.getItem('UID')) // User ID stored in session storage
// let NAME = sessionStorage.getItem('name') // User name stored in session storage

// const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'}) // Create Agora RTC client with VP8 codec

// let localTracks = [] // Array to store local tracks
// let remoteUsers = {} // Object to store remote users

// // Function to join the channel and display local stream
// let joinAndDisplayLocalStream = async () => {
//     document.getElementById('room-name').innerText = CHANNEL // Display channel name

//     client.on('user-published', handelUserJoined) // Set event listener for when a user publishes a stream
//     client.on('user-left', handelUserLeft) // Set event listener for when a user leaves

//     try {
//         await client.join(APP_ID, CHANNEL, TOKEN, UID) // Join the channel
//     } catch(error) {
//         console.error('error') // Log error
//         window.open('/', '_self') // Redirect to home on error
//     }

//     localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() // Create local tracks

//     let member = await createMember() // Create a member

//     // Create a player for local user
//     let player = `<div class="video-container" id="user-container-${UID}">
//                     <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
//                     <div class="video-player" id="user-${UID}"></div>
//                  </div>`

//     document.getElementById('video-streams').insertAdjacentHTML('beforeend', player) // Add player to the DOM
//     localTracks[1].play(`user-${UID}`) // Play local video track

//     await client.publish([localTracks[0], localTracks[1]]) // Publish local tracks
// }

// // Function to handle a user joining the channel
// let handelUserJoined = async (user, mediaType) => {
//     remoteUsers[user.uid] = user // Add user to remote users

//     await client.subscribe(user, mediaType) // Subscribe to the user's stream

//     if(mediaType === 'video') {
//         let player = document.getElementById(`user-container-${user.uid}`)
        
//         if(player != null) {
//             player.remove() // Remove existing player if any
//         }

//         let member = await getMember(user) // Get member details

//         // Create a player for the remote user
//         player = `<div class="video-container" id="user-container-${user.uid}">
//                     <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
//                     <div class="video-player" id="user-${user.uid}"></div>
//                   </div>`
        
//         document.getElementById('video-streams').insertAdjacentHTML('beforeend', player) // Add player to the DOM
//         user.videoTrack.play(`user-${user.uid}`) // Play remote video track
//     }

//     if(mediaType === 'audio') {
//         user.audioTrack.play() // Play remote audio track
//     }
// }

// // Function to handle a user leaving the channel
// let handelUserLeft = async (user) => {
//     delete remoteUsers[user.uid] // Remove user from remote users
//     document.getElementById(`user-container-${user.uid}`).remove() // Remove user's player from the DOM
// }

// // Function to leave the channel and remove local stream
// let leaveAndRemoveLocalStream = async () => {
//     for (let i = 0; i < localTracks.length; i++) {
//         localTracks[i].stop() // Stop each local track
//         localTracks[i].close() // Close each local track
//     }

//     await client.leave() // Leave the channel

//     deleteMember() // Delete the member

//     window.open('/', '_self') // Redirect to home
// }

// // Function to toggle camera on/off
// let toggleCamera = async (e) => {
//     if(localTracks[1].muted) {
//         await localTracks[1].setMuted(false) // Unmute camera
//         e.target.style.backgroundColor = '#fff' // Change button color
//     } else {
//         await localTracks[1].setMuted(true) // Mute camera
//         e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)' // Change button color
//     }
// }

// // Function to toggle microphone on/off
// let toggleMic = async (e) => {
//     if(localTracks[0].muted) {
//         await localTracks[0].setMuted(false) // Unmute microphone
//         e.target.style.backgroundColor = '#fff' // Change button color
//     } else {
//         await localTracks[0].setMuted(true) // Mute microphone
//         e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)' // Change button color
//     }
// }

// // Function to create a member
// let createMember = async () => {
//     let response = await fetch('/create_member/', {
//         method: 'POST',
//         headers: {
//             'Content-type':'application/json'
//         },
//         body: JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
//     })
//     let member = await response.json()
//     return member
// }

// // Function to get a member's details
// let getMember = async (user) => {
//     let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
//     let member = await response.json()
//     console.log(member)
//     return member
// }

// // Function to delete a member
// let deleteMember = async () => {
//     let response = await fetch('/delete_member/', {
//         method: 'POST',
//         headers: {
//             'Content-type':'application/json'
//         },
//         body: JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
//     })
//     let member = await response.json()
// }

// // Join the channel and display the local stream on page load
// joinAndDisplayLocalStream()

// // Add event listeners for various buttons
// window.addEventListener('beforeunload', deleteMember)
// document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
// document.getElementById('camera-btn').addEventListener('click', toggleCamera)
// document.getElementById('mic-btn').addEventListener('click', toggleMic)
