/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

let apiKey;
let sessionId;
let token;
let session;
let publisher;

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

// Unpublish button event listener
const unpublishBtn = document.getElementById("unpublishBtn");
unpublishBtn.addEventListener("click", () => {
  console.log('Unpublishing from the session....', session);
  session.unpublish(publisher);
});

// Publish button event listener
const publishBtn = document.getElementById("publishBtn");
publishBtn.addEventListener("click", () => {
  console.log('Publishing to the session....', session);
  session.publish(publisher, handleError);
});

function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });

  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  // Prevent publisher from getting removed from DOM 
  publisher.on("streamDestroyed", (event) => {
      console.log('Preventing publisher from beeing removed...');
      event.preventDefault();
  });

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError);
    }
  });

  return {session, publisher};
}

// See the config.js file.
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  let objects = initializeSession();
  session = objects.session;
  publisher = objects.publisher;
} else if (SAMPLE_SERVER_BASE_URL) {
  // Make a GET request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + '/session')
  .then((response) => response.json())
  .then((json) => {
    apiKey = json.apiKey;
    sessionId = json.sessionId;
    token = json.token;
    // Initialize an OpenTok Session object
    initializeSession();
  }).catch((error) => {
    handleError(error);
    alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  });
}
