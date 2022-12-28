import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
export const Content = sequelize.define("Content", {
    author: {
        type: DataTypes.STRING,
    },
    contentType: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    firstIndex: {
        type: DataTypes.STRING,
    },
    game: {
        type: DataTypes.STRING,
    },
    name: {
        type: DataTypes.STRING,
    },
    releaseDate: {
        type: DataTypes.STRING,
    },
    attachments: {
        type: DataTypes.JSON,
    },
    originalFilename: {
        type: DataTypes.STRING,
    },
    hash: {
        type: DataTypes.STRING,
        unique: true,
    },
    fileSize: {
        type: DataTypes.STRING,
    },
    files: {
        type: DataTypes.JSON,
    },
    dependencies: {
        type: DataTypes.JSON,
    },
    downloads: {
        type: DataTypes.JSON,
    },
    gametype: {
        type: DataTypes.STRING,
    },
    downloaded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
});
