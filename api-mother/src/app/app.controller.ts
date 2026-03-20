import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('sitemap')
  getSitemap(@Res() res: Response) {
    const html = this.appService.getSitemapHtml();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
