import RSAKey from 'react-native-rsa-expo';
import CryptoES from 'crypto-es';
// import reactNativeBcrypt from 'react-native-bcrypt';
import PasswordHandler from './PasswordHandler';

/**
 * Handles all authentication between the client and server.
 * 
 * Due to the unique authentication pattern used by RothkopfChat, this has to be a custom class.
 */
export default class Authenticator {
  constructor() {
  }

  /**
   * Creates an RSA keypair for the client to use for authentication
   * @param {string} securePasscode The secure passcode the user has entered to secure their private key
   * @param {string} pseudoPasscode The pseudo passcode the user has entered to secure their private key
   * @returns The public and private keys, with the private key being encrypted
   */
  static createKeypair(securePasscode, pseudoPasscode) {
    // Generate encryption keys for RSA encryption
    const bits = 1024;
    const exponent = '10001';
    const rsa = new RSAKey();
    rsa.generate(bits, exponent);
    const publicKey = rsa.getPublicString();
    const privateKey = rsa.getPrivateString();

    // Hash the secure and pseudo passcodes for storage
    // const salt0 = reactNativeBcrypt.genSaltSync(10);
    // const salt1 = reactNativeBcrypt.genSaltSync(10);

    // securePasscode = reactNativeBcrypt.hashSync(securePasscode, salt0);
    // pseudoPasscode = reactNativeBcrypt.hashSync(pseudoPasscode, salt1);

    securePasscode = PasswordHandler.hashPassword(securePasscode);
    pseudoPasscode = PasswordHandler.hashPassword(pseudoPasscode);

    return {
      publicKey: publicKey,
      privateKey: privateKey,
      securePasscode: securePasscode,
      pseudoPasscode: pseudoPasscode,
    };
  }

  /**
   * Attempts to unlock the app and authenticate the user
   * @param {object} securityData The security data object from SecureStore
   * @param {string} passcode The passcode provided by the user
   * @returns The new login state of the app after authentication
   */
  static unlock(securityData, passcode) {
    // Secure login
    const st = new Date().getTime();
    if (PasswordHandler.verifyPassword(passcode, securityData.securePasscode)) {
      const et = new Date().getTime();

      // this.loginState = 1;
      // this.privateKey = privateKey;
      // this.publicKey = securityData.publicKey;

      console.log(securityData.privateKey);

      return {
        loginState: 1,
        privateKey: securityData.privateKey,
        publicKey: securityData.publicKey,
      };
    }
    // Insecure login
    else if (PasswordHandler.verifyPassword(passcode, securityData.pseudoPasscode)) {
      // this.loginState = 2;
      // this.privateKey = '';
      // this.publicKey = '';
      
      return {
        loginState: 2,
        privateKey: '',
        publicKey: '',
      };
    }
    // Invalid login
    else {
      console.log('bad login')
      return {
        loginState: 0,
        privateKey: '',
        publicKey: '',
      };
    }
  }
}