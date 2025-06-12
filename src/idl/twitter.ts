export type Twitter = {
  "version": "0.1.0",
  "name": "twitter",
  "instructions": [
    {
      "name": "createOrUpdateProfile",
      "accounts": [
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        }
      ]
    },
    {
      "name": "postTweet",
      "accounts": [
        {
          "name": "tweet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "timestamp",
          "type": "i64"
        },
        {
          "name": "parent",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tweet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "parent",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    }
  ]
};

export const IDL: Twitter = {
  "version": "0.1.0",
  "name": "twitter",
  "instructions": [
    {
      "name": "createOrUpdateProfile",
      "accounts": [
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        }
      ]
    },
    {
      "name": "postTweet",
      "accounts": [
        {
          "name": "tweet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "timestamp",
          "type": "i64"
        },
        {
          "name": "parent",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tweet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "parent",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    }
  ]
};