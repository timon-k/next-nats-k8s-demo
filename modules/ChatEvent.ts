/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "chat";

export interface Message {
    username: string;
    message: string;
}

export interface UserLogin {
    username: string;
}

export interface UserLogout {
    username: string;
}

export interface ChatEvent {
    chatEvent?:
        | { $case: "message"; message: Message }
        | { $case: "login"; login: UserLogin }
        | { $case: "logout"; logout: UserLogout };
}

function createBaseMessage(): Message {
    return { username: "", message: "" };
}

export const Message = {
    encode(message: Message, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.username !== "") {
            writer.uint32(10).string(message.username);
        }
        if (message.message !== "") {
            writer.uint32(18).string(message.message);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): Message {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.username = reader.string();
                    break;
                case 2:
                    message.message = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): Message {
        const message = createBaseMessage();
        message.username =
            object.username !== undefined && object.username !== null
                ? String(object.username)
                : "";
        message.message =
            object.message !== undefined && object.message !== null ? String(object.message) : "";
        return message;
    },

    toJSON(message: Message): unknown {
        const obj: any = {};
        message.username !== undefined && (obj.username = message.username);
        message.message !== undefined && (obj.message = message.message);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<Message>, I>>(object: I): Message {
        const message = createBaseMessage();
        message.username = object.username ?? "";
        message.message = object.message ?? "";
        return message;
    },
};

function createBaseUserLogin(): UserLogin {
    return { username: "" };
}

export const UserLogin = {
    encode(message: UserLogin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.username !== "") {
            writer.uint32(10).string(message.username);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): UserLogin {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUserLogin();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.username = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): UserLogin {
        const message = createBaseUserLogin();
        message.username =
            object.username !== undefined && object.username !== null
                ? String(object.username)
                : "";
        return message;
    },

    toJSON(message: UserLogin): unknown {
        const obj: any = {};
        message.username !== undefined && (obj.username = message.username);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<UserLogin>, I>>(object: I): UserLogin {
        const message = createBaseUserLogin();
        message.username = object.username ?? "";
        return message;
    },
};

function createBaseUserLogout(): UserLogout {
    return { username: "" };
}

export const UserLogout = {
    encode(message: UserLogout, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.username !== "") {
            writer.uint32(10).string(message.username);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): UserLogout {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseUserLogout();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.username = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): UserLogout {
        const message = createBaseUserLogout();
        message.username =
            object.username !== undefined && object.username !== null
                ? String(object.username)
                : "";
        return message;
    },

    toJSON(message: UserLogout): unknown {
        const obj: any = {};
        message.username !== undefined && (obj.username = message.username);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<UserLogout>, I>>(object: I): UserLogout {
        const message = createBaseUserLogout();
        message.username = object.username ?? "";
        return message;
    },
};

function createBaseChatEvent(): ChatEvent {
    return { chatEvent: undefined };
}

export const ChatEvent = {
    encode(message: ChatEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.chatEvent?.$case === "message") {
            Message.encode(message.chatEvent.message, writer.uint32(10).fork()).ldelim();
        }
        if (message.chatEvent?.$case === "login") {
            UserLogin.encode(message.chatEvent.login, writer.uint32(18).fork()).ldelim();
        }
        if (message.chatEvent?.$case === "logout") {
            UserLogout.encode(message.chatEvent.logout, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): ChatEvent {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseChatEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chatEvent = {
                        $case: "message",
                        message: Message.decode(reader, reader.uint32()),
                    };
                    break;
                case 2:
                    message.chatEvent = {
                        $case: "login",
                        login: UserLogin.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.chatEvent = {
                        $case: "logout",
                        logout: UserLogout.decode(reader, reader.uint32()),
                    };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): ChatEvent {
        const message = createBaseChatEvent();
        if (object.message !== undefined && object.message !== null) {
            message.chatEvent = { $case: "message", message: Message.fromJSON(object.message) };
        }
        if (object.login !== undefined && object.login !== null) {
            message.chatEvent = { $case: "login", login: UserLogin.fromJSON(object.login) };
        }
        if (object.logout !== undefined && object.logout !== null) {
            message.chatEvent = { $case: "logout", logout: UserLogout.fromJSON(object.logout) };
        }
        return message;
    },

    toJSON(message: ChatEvent): unknown {
        const obj: any = {};
        message.chatEvent?.$case === "message" &&
            (obj.message = message.chatEvent?.message
                ? Message.toJSON(message.chatEvent?.message)
                : undefined);
        message.chatEvent?.$case === "login" &&
            (obj.login = message.chatEvent?.login
                ? UserLogin.toJSON(message.chatEvent?.login)
                : undefined);
        message.chatEvent?.$case === "logout" &&
            (obj.logout = message.chatEvent?.logout
                ? UserLogout.toJSON(message.chatEvent?.logout)
                : undefined);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<ChatEvent>, I>>(object: I): ChatEvent {
        const message = createBaseChatEvent();
        if (
            object.chatEvent?.$case === "message" &&
            object.chatEvent?.message !== undefined &&
            object.chatEvent?.message !== null
        ) {
            message.chatEvent = {
                $case: "message",
                message: Message.fromPartial(object.chatEvent.message),
            };
        }
        if (
            object.chatEvent?.$case === "login" &&
            object.chatEvent?.login !== undefined &&
            object.chatEvent?.login !== null
        ) {
            message.chatEvent = {
                $case: "login",
                login: UserLogin.fromPartial(object.chatEvent.login),
            };
        }
        if (
            object.chatEvent?.$case === "logout" &&
            object.chatEvent?.logout !== undefined &&
            object.chatEvent?.logout !== null
        ) {
            message.chatEvent = {
                $case: "logout",
                logout: UserLogout.fromPartial(object.chatEvent.logout),
            };
        }
        return message;
    },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
    ? T
    : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends { $case: string }
    ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
    : T extends {}
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
    ? P
    : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<Exclude<keyof I, KeysOfUnion<P>>, never>;

if (_m0.util.Long !== Long) {
    _m0.util.Long = Long as any;
    _m0.configure();
}
