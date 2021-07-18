import { LoginHandler } from "../../app/Handlers/LoginHandler";
import { Server } from "../../app/Server/Server";
import { Authorizer } from '../../app/Authorization/Authorizer';
import { DataHandler } from '../../app/Handlers/DataHandler';
import { UsersDBAccess } from '../../app/Data/UsersDBAccess';
jest.mock('../../app/Handlers/LoginHandler');
jest.mock('../../app/Handlers/DataHandler');
jest.mock('../../app/Authorization/Authorizer');
// import { createServer } from "http";
const requestMock = {
  url: "",
};
const responseMock = {
  end: jest.fn(),
};

const listtenMock = {
  listen: jest.fn(),
};

jest.mock("http", () => ({
  createServer: (cb: any) => {
    cb(requestMock, responseMock);
    return listtenMock;
  },
}));

describe("Server test suit", () => {
    test('shold create server on poer 8080', () => {
        new Server().startServer();
        expect(listtenMock.listen).toBeCalledWith(8080);
        expect(responseMock.end).toBeCalled();
    });

    test('should handle login request', () => {
        requestMock.url = 'http://localhost:8080/login';
        new Server().startServer();
        const handleRequestSpy = jest.spyOn(LoginHandler.prototype, 'handleRequest');
        expect(handleRequestSpy).toBeCalled();
        expect(LoginHandler).toBeCalledWith(requestMock, responseMock, expect.any(Authorizer));
    });

    test('should handle data request', () => {
        requestMock.url = 'http://localhost:8080/users';
        new Server().startServer();
        expect(DataHandler).toBeCalledWith(requestMock, responseMock, expect.any(Authorizer), expect.any(UsersDBAccess));
        const handleRequestSpy = jest.spyOn(LoginHandler.prototype, 'handleRequest');
        expect(handleRequestSpy).toBeCalled();
        expect(LoginHandler).toBeCalledWith(requestMock, responseMock, expect.any(Authorizer));
    });

});
