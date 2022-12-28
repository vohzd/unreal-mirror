import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
export const Mutator = sequelize.define("Mutator", {
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
    }
});
