// models/User.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        userClass: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true,
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
    });

    User.associate = (models) => {
        User.hasMany(models.Message, {
            foreignKey: 'userId',
            as: 'messages',
        });
        User.belongsToMany(models.StudyGroup, {
            through: 'usergroups',
            foreignKey: 'UserId',
            otherKey: 'StudyGroupId',
            as: 'studyGroups',
        });
    };

    return User;
};