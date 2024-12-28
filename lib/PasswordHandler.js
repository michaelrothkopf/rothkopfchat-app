import CryptoES from 'crypto-es';

export default class PasswordHandler {
  /**
   * Hashes a password using a pseudorandom salt
   * @param {string} password The password to hash
   * @returns The hashed password and salt
   */
  static hashPassword(password) {
    // Create a random (enough) salt
    const salt = Math.random().toString();
    // Return the hash data
    return {
      pwd: CryptoES.SHA256(password + salt).toString(),
      salt: salt,
    };
  }

  /**
   * Verifies a password attempt against a stored password
   * @param {string} attempt The entered password
   * @param {object} data The password data from storage
   * @returns Whether the password attempt is valid
   */
  static verifyPassword(attempt, data) {
    // Extract the password and salt from the data
    const { pwd, salt } = JSON.parse(data);
    // Check if the attempt is equal
    return (CryptoES.SHA256(attempt + salt).toString() === pwd);
  }
}