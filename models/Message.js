// models/Message.js
module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'studygroups',
                key: 'id',
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        filePath: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    Message.associate = (models) => {
        Message.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        Message.belongsTo(models.StudyGroup, {
            foreignKey: 'groupId',
            as: 'studyGroup',
        });
    };

    return Message;
};