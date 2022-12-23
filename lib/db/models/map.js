import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
export const Map = sequelize.define("Map", {
    author: {
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
});
