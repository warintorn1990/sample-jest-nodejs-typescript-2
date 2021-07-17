import { LoginHandler } from "../../app/Handlers/LoginHandler";
import { HTTP_CODES, HTTP_METHODS, SessionToken } from "../../app/Models/ServerModels";
import { Utils } from "../../app/Utils/Utils";

describe('Login Handler test suit', () => {
    let loginHandler: LoginHandler;

    const requestMock = {
        method: ''
    };
    const responseMock = {
        writeHead: jest.fn(),
        write: jest.fn(),
        statusCode: 201
    };
    const authorizerMock = {
        generateToken: jest.fn()
    };
    const getRequestBodyMock = jest.fn();

    beforeEach(()=> {
        loginHandler = new LoginHandler(
            requestMock as any,
            responseMock as any,
            authorizerMock as any
        )

        Utils.getRequestBody = getRequestBodyMock;
        // requestMock.method = HTTP_METHODS.POST;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const someSessionToken: SessionToken = {
        tokenId: 'someTokenId',
        userName: 'someUsername',
        valid: true,
        expirationTime: new Date(),
        accessRights: [1, 2, 3]
    }

    test('option request', async () => {
        requestMock.method = HTTP_METHODS.OPTIONS;
        await loginHandler.handleRequest();
        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
    });

    test('not handle http method', async () => {
        requestMock.method = "SomeRandomMethod";
        await loginHandler.handleRequest();
        expect(responseMock.writeHead).not.toHaveBeenCalled();
    });

    test('get request with valid login', async () => {
        requestMock.method = HTTP_METHODS.POST;
        getRequestBodyMock.mockReturnValueOnce({
            username: 'someUser',
            password: 'password'
        });
        authorizerMock.generateToken.mockReturnValueOnce(someSessionToken);
        await loginHandler.handleRequest();
        expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
        expect(responseMock.writeHead).toBeCalledWith(
            HTTP_CODES.CREATED, { 'Content-Type': 'application/json' }
        );
        expect(responseMock.write).toBeCalledWith(JSON.stringify(someSessionToken));
    });

    test('get request with invalid login', async () => {
        requestMock.method = HTTP_METHODS.POST;
        getRequestBodyMock.mockReturnValueOnce({
            username: 'someUser',
            password: 'password'
        });
        authorizerMock.generateToken.mockReturnValueOnce(null);
        await loginHandler.handleRequest();
        expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
        expect(responseMock.write).toBeCalledWith('wrong username or password');
    });

    test('get request with unexpected error', async () => {
        requestMock.method = HTTP_METHODS.POST;
        getRequestBodyMock.mockRejectedValueOnce(new Error('something went wrong!'));
        authorizerMock.generateToken.mockReturnValueOnce(null);
        await loginHandler.handleRequest();
        expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
        expect(responseMock.write).toBeCalledWith('Internal error: something went wrong!');
    });
});

