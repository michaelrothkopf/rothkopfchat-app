# RothkopfChat

This repository contains the client code for RothkopfChat. The server code is in a [separate repository](https://github.com/michaelrothkopf/rothkopfchat-server).

### The Rothkopf Chat Communications App

This application serves to provide a private communication channel. I was inspired to create it after hearing about locked devices with similar security features.

# Features

RothkopfChat provides a number of convenience, security, administration features to both users and admins.

## Security

RothkopfChat's security features are built to withstand most low-skill and/or effort attacks. They are not designed to handle police intervention or advanced penetration attempts.

### Password Protection

The application is fully password protected, with two passcodes for an added layer of security. The first passcode, the "secure passcode," provides full, unrestricted access to the application. The second passcode, the "pseudopasscode," restricts the user's access to the application by removing the chat screen and foregoing the connection to the server completely.

The details of the implementation allow for a convincing faux-application when the pseudopasscode is entered. The application will modify its display state to convincingly hide certain features, such as the chat function, making the application simply appear as a pager system rather than a full messaging service.

### RSA Encryption

The initial server authentication is verified using RSA signatures at the time of the intial socket connection (after the secure passcode has been successfully validated). The private and public keys are stored in an encrypted store provided by Expo (SecureStore) which the mobile operating system developers maintain.

Certain other high-risk requests, such as the request to lock an account out (which is made by the device itself as a security measure) and the request to send a page are also RSA encrypted, causing a small delay but reducing the risk of socket connection packet imitation as a method of making illegitemately authenticated requests.

By requiring RSA encryption to perform these actions, it can be assured that any bad actor who is able to perform these actions without proper authorization has the required technology and skills to do so, thereby significantly increasing the difficulty of such an attack.

### Server-Side Signup

Accounts must be made on the server administration page before any user can activate a mobile account. While this feature is standard for most private applications, it provides an extra layer of security in that no user can even see the contents of the application without intent from an administrator or significant skills and willpower.

## Communication

The communication features of RothkopfChat are almost entirely custom, foregoing any third-party libraries (barring the Expo SDKs) outside of initial development and testing.

### Messaging

The chat display and input user interfaces are also fully custom. Messages are stored server side for security reasons and only the last 100 messages are visible to any given user. Users cannot find chats to which they do not belong and chats are group-locked server side.

### Paging

The pager interface is rather simple, requiring both client- and server-side authentication to be visible at all, and further verifying authentication in the server's routes. An added security feature of the pager system is the lack of a drop-down menu for the target group; the user must know the exact name of the group in order ot send it a page, preventing users who have simply stolen the unlocked device of an authorized user from performing a page.
