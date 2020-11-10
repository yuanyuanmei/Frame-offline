package com.ljcx.code.dto;

import com.ljcx.common.utils.PageDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
@NotNull(message = "现场上报信息不能为空")
public class SceneReportDto extends PageDto {

	/**
	 * 
	 */
	private Long id;
	/**
	 * 服务类型
	 */
	private Integer type;
	/**
	 * 内容
	 */
	private String content;
	/**
	 * 横坐标
	 */
	private String lng;
	/**
	 * 纵坐标
	 */
	private String lat;
	/**
	 * 地址
	 */
	private String address;
	
	/**
 	* id集合
 	*/
	private List<Long> ids;
}
