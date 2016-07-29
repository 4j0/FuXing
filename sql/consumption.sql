/*
 Navicat Premium Data Transfer

 Source Server         : mysql_local
 Source Server Type    : MySQL
 Source Server Version : 50713
 Source Host           : localhost
 Source Database       : fuxing

 Target Server Type    : MySQL
 Target Server Version : 50713
 File Encoding         : utf-8

 Date: 07/29/2016 16:11:32 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `consumption`
-- ----------------------------
DROP TABLE IF EXISTS `consumption`;
CREATE TABLE `consumption` (
  `consumption_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `consumption_name` varchar(255) DEFAULT NULL,
  `consumption_price` smallint(6) DEFAULT NULL,
  `consumption_quantity` tinyint(4) DEFAULT NULL,
  `bill_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`consumption_id`),
  KEY `bill_id` (`bill_id`),
  CONSTRAINT `bill_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bill` (`bill_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
