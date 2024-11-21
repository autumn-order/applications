interface OAuthResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token: string;
}

interface TokenData {
    CharacterID: number;
    CharacterName: string;
    ExpiresOn: string;
    Scopes: string;
    TokenType: string;
    CharacterOwnerHash: string;
    IntellectualProperty: string;
}