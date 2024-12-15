module.exports = (sequelize, DataTypes) => {
    const StudyGroup = sequelize.define('StudyGroup', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        description: {
            type: DataTypes.TEXT,
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

    StudyGroup.associate = (models) => {
        StudyGroup.hasMany(models.Message, {
            foreignKey: 'groupId',
            as: 'messages',
        });
        StudyGroup.belongsToMany(models.User, {
            through: 'usergroups',
            foreignKey: 'StudyGroupId',
            otherKey: 'UserId',
            as: 'users',
        });
    };

    return StudyGroup;
}; 