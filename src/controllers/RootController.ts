import * as pug from 'pug';
import * as path from 'path';
import * as jsonwebtoken from 'jsonwebtoken';

const renderIndex = pug.compileFile(path.resolve(process.cwd(), 'static/views/index.pug'));

export class RootController {

    renderHomePage(data: { [key: string]: any } = {}): string {
        if (process.env.JWT_SECRET) {
            data.jwt = jsonwebtoken.sign({}, process.env.JWT_SECRET, { expiresIn: '10m' });
        } else {
            console.log('Uh oh! No JWT_SECRET found. Rendering homepage without JWT');
        }
        return renderIndex(data);
    }
    
}
