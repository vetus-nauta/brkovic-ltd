# Brkovic Ecosystem Authentication

Goal: a user registered on `brkovic.ltd` should automatically be usable on `game.brkovic.ltd`. The game app must not create a separate account silo.

## Future Flow

1. User logs in or registers on `brkovic.ltd`.
2. `brkovic.ltd` becomes the primary identity provider.
3. When the user opens `game.brkovic.ltd`, the main site redirects them to:

```text
https://game.brkovic.ltd/api/auth/ecosystem-login.php?token=...
```

4. The token is a short-lived signed payload:

```json
{
  "sub": "brkovic-user-id",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1770000000,
  "exp": 1770000300,
  "return_to": "/"
}
```

5. Signature format:

```text
base64url(json_payload).hex_hmac_sha256(base64url(json_payload), shared_secret)
```

6. `game.brkovic.ltd` verifies the signature and expiry, then finds or creates the local game profile linked by:

```text
provider = brkovic.ltd
ecosystem_user_id = sub
email = email
```

7. The game creates its own session cookie for `game.brkovic.ltd`.

## Current State

The endpoint exists but is disabled:

```php
'ecosystem_sso_enabled' => false
```

Enable it only after `brkovic.ltd` has real account registration/login and both apps share a private secret outside Git.

## Why Not Share One Cookie

Browsers can share cookies across subdomains only when the cookie domain is set to `.brkovic.ltd`, but this couples session security and logout behavior across apps. A signed short-lived SSO token keeps `brkovic.ltd` as the account owner while allowing `game.brkovic.ltd` to maintain a separate app session and game progress.

