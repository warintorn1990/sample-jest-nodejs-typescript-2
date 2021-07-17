import { Authorizer } from "../../app/Authorization/Authorizer";
import { SessionTokenDBAccess } from "../../app/Authorization/SessionTokenDBAccess";
import { UserCredentialsDbAccess } from "../../app/Authorization/UserCredentialsDbAccess";
import { Account, SessionToken, TokenState } from "../../app/Models/ServerModels";
jest.mock("../../app/Authorization/SessionTokenDBAccess");
jest.mock("../../app/Authorization/UserCredentialsDbAccess");

const someAccount: Account = {
    username: 'someUser',
    password: 'somePassword'
}

describe('Authorizer test suite', () => {
    let autherizer: Authorizer;

    const sessionTokenDBAccessMock = {
        storeSessionToken: jest.fn(),
        getToken: jest.fn()
    };
    const userCredentialsDbAccessMock = {
        getUserCredential: jest.fn()
    };

    beforeEach(() => {
        autherizer = new Authorizer(
            sessionTokenDBAccessMock as any,
            userCredentialsDbAccessMock as any
        )
    });

    test('constructor argument', () => {
        new Authorizer();
        expect(SessionTokenDBAccess).toBeCalled();
        expect(UserCredentialsDbAccess).toBeCalled();
    });

    test('shold return SessionToken for valid credentuals', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);
        jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);
        
        userCredentialsDbAccessMock.getUserCredential.mockResolvedValueOnce({
            username: 'someUser',
            accessRights: [1, 2, 3]
        });

        const expectedSessionToken: SessionToken = {
            accessRights: [1, 2, 3],
            userName: 'someUser',
            valid: true,
            expirationTime: new Date(1000 * 60 * 60),
            tokenId: ''
        };

        const sessionToken = await autherizer.generateToken(someAccount);
        expect(expectedSessionToken).toEqual(sessionToken);
        expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(sessionToken);
    });
});