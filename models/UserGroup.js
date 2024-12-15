module.exports = (sequelize, DataTypes) => {
    const UserGroup = sequelize.define('UserGroup', {
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
        StudyGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'studygroups',
                key: 'id',
            },
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    });

    return UserGroup;
}; 