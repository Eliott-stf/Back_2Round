import { Controller, Post, Delete, Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MediaService } from './media.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';


@Controller('media')
export class MediaController {

  constructor(private readonly mediaService: MediaService) { }

  /**
    * POST 
    * Upload une image 
    * @Auth Utilisateur authentifié.
    */
  @Post('products/:productId')
  @Auth()
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = extname(file.originalname).toLowerCase();
      if (!allowed.includes(ext)) {
        return cb(new Error('Type de fichier non autorisé'), false);
      }
      cb(null, true);
    },
  }))
  uploadImages(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.mediaService.uploadProductImages(user.id, productId, files);
  }

  /**
    * DELETE 
    * Supprimer une image 
    * @Auth Utilisateur authentifié.
    */
  @Delete(':id')
  @Auth()
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.mediaService.remove(user.id, id);
  }

}