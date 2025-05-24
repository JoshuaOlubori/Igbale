export function generateUsername(firstName?: string, lastName?: string): string {const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number
    if (!firstName && !lastName) {
        return `UnknownUser-${randomNum}`;
    }
    
    const first = firstName ? firstName.toLowerCase() : '';
    const last = lastName ? lastName.toLowerCase() : '';
    let username = '';
    if (first && last) {
        username = `${last}-${first}-${randomNum}`;
    } else if (last) {
        username = `${last}-${randomNum}`;
    } else if (first) {
        username = `${first}-${randomNum}`;
    }
    // Capitalize first letter, rest lowercase
    return username.charAt(0).toUpperCase() + username.slice(1);
}
