export type Message = {
    type: "message";
    username: string;
    message: string;
};

export type UserLogin = {
    type: "login";
    username: string;
};

export type UserLogout = {
    type: "logout";
    username: string;
};

export type ChatEvent = Message | UserLogin | UserLogout;
