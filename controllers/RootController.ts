import * as pug from 'pug';
import * as path from 'path';

const renderIndex = pug.compileFile(path.resolve(process.cwd(), 'static/views/index.pug'));

export class RootController {

    renderHomePage(): string {
        return renderIndex();
    }
}
